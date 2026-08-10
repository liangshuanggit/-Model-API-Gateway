import express from "express";
import { DeepSeekWebClient } from "../providers/deepseek-web.js";
import { createConversationStore } from "../core/conversation-store-factory.js";
import { createConversationLock } from "../core/conversation-lock-factory.js";
import { redisClient } from "../core/redis-client.js";
import { openAIModel } from "../services/model-registry.js";
import { toOpenAIResponse, writeSSE, writeDone } from "../adapters/openai-format.js";

const router = express.Router();
const deepseek = new DeepSeekWebClient({ token: process.env.DEEPSEEK_TOKEN });
const storeOptions = { redis: redisClient, ttlMs: Number(process.env.CONVERSATION_TTL_MS) || 24 * 60 * 60 * 1000, maxSize: Number(process.env.CONVERSATION_MAX_SIZE) || 10000, prefix: process.env.CONVERSATION_PREFIX || "model-api:conversation:", waitMs: Number(process.env.CONVERSATION_LOCK_WAIT_MS) || 30000, retryMs: Number(process.env.CONVERSATION_LOCK_RETRY_MS) || 100 };
const conversations = createConversationStore(storeOptions);
const locks = createConversationLock({ ...storeOptions, ttlMs: Number(process.env.CONVERSATION_LOCK_TTL_MS) || 120000 });

const roles = new Set(["system", "user", "assistant", "tool", "developer"]);
function getConversationId(req, body) { return body.conversation_id || req.get("x-conversation-id") || req.get("x-session-id"); }
function validationError(message, param, code = "invalid_value") { return { status: 400, body: { error: { message, type: "invalid_request_error", param, code } } }; }
function validateContent(content, index) {
  if (typeof content === "string") return null;
  if (!Array.isArray(content) || content.length === 0) return validationError(`messages[${index}].content must be a string or non-empty content array`, `messages[${index}].content`);
  for (let j = 0; j < content.length; j += 1) {
    const part = content[j];
    if (!part || typeof part !== "object" || typeof part.type !== "string") return validationError(`messages[${index}].content[${j}] must contain a type`, `messages[${index}].content[${j}]`);
    if (part.type === "text" && typeof part.text !== "string") return validationError(`messages[${index}].content[${j}].text must be a string`, `messages[${index}].content[${j}].text`);
    if ((part.type === "image_url" || part.type === "input_image") && (!part.image_url || typeof part.image_url !== "object" || typeof part.image_url.url !== "string")) return validationError(`messages[${index}].content[${j}].image_url.url is required`, `messages[${index}].content[${j}].image_url.url`);
  }
  return null;
}
function validateRequest(body) {
  if (!Array.isArray(body.messages) || body.messages.length === 0) return validationError("messages must be a non-empty array", "messages");
  for (let i = 0; i < body.messages.length; i += 1) {
    const message = body.messages[i];
    if (!message || typeof message !== "object" || Array.isArray(message)) return validationError(`messages[${i}] must be an object`, `messages[${i}]`);
    if (!roles.has(message.role)) return validationError(`messages[${i}].role is invalid`, `messages[${i}].role`);
    const contentError = validateContent(message.content, i); if (contentError) return contentError;
    if (message.role === "tool" && typeof message.tool_call_id !== "string") return validationError(`messages[${i}].tool_call_id is required for tool messages`, `messages[${i}].tool_call_id`);
  }
  if (body.model !== undefined && typeof body.model !== "string") return validationError("model must be a string", "model");
  for (const name of ["temperature", "top_p"]) if (body[name] !== undefined && (typeof body[name] !== "number" || !Number.isFinite(body[name]))) return validationError(`${name} must be a finite number`, name);
  if (body.max_tokens !== undefined && (!Number.isInteger(body.max_tokens) || body.max_tokens <= 0)) return validationError("max_tokens must be a positive integer", "max_tokens");
  if (body.stop !== undefined && !(typeof body.stop === "string" || Array.isArray(body.stop))) return validationError("stop must be a string or array", "stop");
  if (body.stream !== undefined && typeof body.stream !== "boolean") return validationError("stream must be a boolean", "stream");
  if (body.stream_options !== undefined && (!body.stream_options || typeof body.stream_options !== "object" || Array.isArray(body.stream_options))) return validationError("stream_options must be an object", "stream_options");
  return null;
}
function flattenMessageContent(content) { return typeof content === "string" ? content : content.filter((part) => part.type === "text").map((part) => part.text).join("\n"); }
async function saveConversation(key, result, previous) {
  if (!key) return;
  const sessionId = result?.sessionId || result?.chat_session_id || result?.session_id || result?.conversation_id || previous?.sessionId;
  const parentMessageId = result?.messageId || result?.parent_message_id || result?.message_id || result?.id || previous?.parentMessageId;
  if (sessionId || parentMessageId) await conversations.set(key, { sessionId, parentMessageId });
}

router.post("/v1/chat/completions", async (req, res) => {
  const body = req.body || {};
  const invalid = validateRequest(body); if (invalid) return res.status(invalid.status).json(invalid.body);
  const model = body.model || "deepseek-chat";
  if (!openAIModel(model)) return res.status(404).json({ error: { message: `The model '${model}' does not exist`, type: "invalid_request_error", param: "model", code: "model_not_found" } });
  const { temperature, max_tokens, top_p, stop, stream = false, stream_options = {} } = body;
  const messages = body.messages.map((message) => ({ ...message, content: flattenMessageContent(message.content) }));
  const key = getConversationId(req, body);
  return locks.run(key, async () => {
    const previous = key ? await conversations.get(key) : undefined;
    const providerOptions = { messages, model, temperature, max_tokens, top_p, stop, sessionId: previous?.sessionId, parentMessageId: previous?.parentMessageId };
    const controller = new AbortController(); let clientClosed = false;
    const onClose = () => { clientClosed = true; controller.abort(); }; req.once("close", onClose);
    try {
      if (!stream) { const result = await deepseek.chat(providerOptions, { signal: controller.signal }); if (clientClosed || res.writableEnded) return; await saveConversation(key, result, previous); return res.json(toOpenAIResponse(result, model)); }
      const id = `chatcmpl-${Date.now()}`; res.status(200); res.setHeader("Content-Type", "text/event-stream; charset=utf-8"); res.setHeader("Cache-Control", "no-cache, no-transform"); res.setHeader("Connection", "keep-alive"); if (typeof res.flushHeaders === "function") res.flushHeaders();
      let sentRole = false; let lastChunk;
      for await (const chunk of deepseek.chatStream(providerOptions, { signal: controller.signal })) { if (clientClosed || res.writableEnded || res.destroyed) break; lastChunk = chunk; const content = chunk?.content ?? chunk?.answer ?? chunk?.text ?? chunk?.delta?.content ?? ""; if (!content) continue; writeSSE(res, { id, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model, choices: [{ index: 0, delta: sentRole ? { content } : { role: "assistant", content }, finish_reason: null }] }); sentRole = true; }
      if (clientClosed || res.writableEnded || res.destroyed) return; await saveConversation(key, lastChunk, previous); writeSSE(res, { id, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model, choices: [{ index: 0, delta: {}, finish_reason: "stop" }] }); if (stream_options?.include_usage) writeSSE(res, { id, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model, choices: [], usage: lastChunk?.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 } }); writeDone(res); return res.end();
    } catch (error) {
      if (clientClosed || error?.code === "ERR_CANCELED" || error?.name === "CanceledError" || error?.name === "AbortError") return;
      const status = error.message === "DEEPSEEK_TOKEN is not configured" ? 503 : error.message === "Conversation lock timeout" ? 409 : 502;
      if (stream) { if (!res.headersSent) { res.status(status); res.setHeader("Content-Type", "text/event-stream; charset=utf-8"); } if (!res.destroyed) { writeSSE(res, { error: { message: error.message, type: status === 409 ? "conversation_lock_error" : "provider_error" } }); writeDone(res); res.end(); } return; }
      if (!res.headersSent) return res.status(status).json({ error: { message: error.message, type: status === 409 ? "conversation_lock_error" : "provider_error" } });
    } finally { req.off("close", onClose); }
  });
});
export default router;
