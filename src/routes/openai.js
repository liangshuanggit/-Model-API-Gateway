import express from "express";
import { DeepSeekWebClient } from "../providers/deepseek-web.js";
import { toOpenAIResponse, toOpenAIChunk, writeSSE, writeDone } from "../adapters/openai-format.js";

const router = express.Router();
const deepseek = new DeepSeekWebClient({ token: process.env.DEEPSEEK_TOKEN });

router.post("/v1/chat/completions", async (req, res) => {
  const body = req.body || {};
  const { messages, model = "deepseek-chat", temperature, max_tokens, stream = false } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      error: { message: "messages must be a non-empty array", type: "invalid_request_error", param: "messages" }
    });
  }

  try {
    const result = await deepseek.chat({ messages, model, temperature, max_tokens });

    if (!stream) return res.json(toOpenAIResponse(result, model));

    const id = `chatcmpl-${Date.now()}`;
    res.status(200);
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    if (typeof res.flushHeaders === "function") res.flushHeaders();

    writeSSE(res, toOpenAIChunk(result, model, id));
    writeDone(res);
    return res.end();
  } catch (error) {
    const status = error.message === "DEEPSEEK_TOKEN is not configured" ? 503 : 502;
    if (stream) {
      if (!res.headersSent) {
        res.status(status);
        res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      }
      writeSSE(res, { error: { message: error.message, type: "provider_error" } });
      writeDone(res);
      return res.end();
    }
    return res.status(status).json({ error: { message: error.message, type: "provider_error" } });
  }
});

export default router;
