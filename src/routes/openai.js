import express from "express";
import { DeepSeekWebClient } from "../providers/deepseek-web.js";
import { ConversationStore } from "../core/conversation-store.js";
import { toOpenAIResponse, writeSSE, writeDone } from "../adapters/openai-format.js";

const router = express.Router();
const deepseek = new DeepSeekWebClient({ token: process.env.DEEPSEEK_TOKEN });
const conversations = new ConversationStore({ ttlMs: Number(process.env.CONVERSATION_TTL_MS) || 24 * 60 * 60 * 1000 });

function getConversationId(req, body) { return body.conversation_id || req.get("x-conversation-id") || req.get("x-session-id"); }
function saveConversation(key, result, previous) {
  if (!key) return;
  const sessionId = result?.chat_session_id || result?.session_id || result?.conversation_id || previous?.sessionId;
  const parentMessageId = result?.parent_message_id || result?.message_id || result?.id || previous?.parentMessageId;
  if (sessionId || parentMessageId) conversations.set(key, { sessionId, parentMessageId });
}

router.post("/v1/chat/completions", async (req, res) => {
  const body = req.body || {};
  const { messages, model = "deepseek-chat", temperature, max_tokens, top_p, stop, stream = false, stream_options = {} } = body;
  if (!Array.isArray(messages) || messages.length === 0) return res.status(400).json({ error: { message: "messages must be a non-empty array", type: "invalid_request_error", param: "messages" } });

  const key = getConversationId(req, body);
  const previous = key ? conversations.get(key) : undefined;
  const providerOptions = { messages, model, temperature, max_tokens, top_p, stop, sessionId: previous?.sessionId, parentMessageId: previous?.parentMessageId };
  const controller = new AbortController();
  let clientClosed = false;
  const onClose = () => { clientClosed = true; controller.abort(); };
  req.once("close", onClose);

  try {
    if (!stream) {
      const result = await deepseek.chat(providerOptions, { signal: controller.signal });
      if (clientClosed || res.writableEnded) return;
      saveConversation(key, result, previous);
      return res.json(toOpenAIResponse(result, model));
    }

    const id = `chatcmpl-${Date.now()}`;
    res.status(200); res.setHeader("Content-Type", "text/event-stream; charset=utf-8"); res.setHeader("Cache-Control", "no-cache, no-transform"); res.setHeader("Connection", "keep-alive");
    if (typeof res.flushHeaders === "function") res.flushHeaders();
    let sentRole = false; let lastChunk;
    for await (const chunk of deepseek.chatStream(providerOptions, { signal: controller.signal })) {
      if (clientClosed || res.writableEnded || res.destroyed) break;
      lastChunk = chunk;
      const content = chunk?.answer ?? chunk?.content ?? chunk?.text ?? chunk?.delta?.content ?? "";
      if (!content) continue;
      writeSSE(res, { id, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model, choices: [{ index: 0, delta: sentRole ? { content } : { role: "assistant", content }, finish_reason: null }] });
      sentRole = true;
    }
    if (clientClosed || res.writableEnded || res.destroyed) return;
    saveConversation(key, lastChunk, previous);
    writeSSE(res, { id, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model, choices: [{ index: 0, delta: {}, finish_reason: "stop" }] });
    if (stream_options?.include_usage) writeSSE(res, { id, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model, choices: [], usage: lastChunk?.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 } });
    writeDone(res); return res.end();
  } catch (error) {
    if (clientClosed || error?.code === "ERR_CANCELED" || error?.name === "CanceledError" || error?.name === "AbortError") return;
    const status = error.message === "DEEPSEEK_TOKEN is not configured" ? 503 : 502;
    if (stream) {
      if (!res.headersSent) { res.status(status); res.setHeader("Content-Type", "text/event-stream; charset=utf-8"); }
      if (!res.destroyed) { writeSSE(res, { error: { message: error.message, type: "provider_error" } }); writeDone(res); res.end(); }
      return;
    }
    if (!res.headersSent) return res.status(status).json({ error: { message: error.message, type: "provider_error" } });
  } finally { req.off("close", onClose); }
});

export default router;
