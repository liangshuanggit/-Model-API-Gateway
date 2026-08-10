import express from "express";
import { DeepSeekWebClient } from "../providers/deepseek-web.js";
import { toOpenAIResponse } from "../adapters/openai-format.js";

const router = express.Router();
const deepseek = new DeepSeekWebClient({ token: process.env.DEEPSEEK_TOKEN });

router.post("/v1/chat/completions", async (req, res) => {
  const body = req.body || {};
  const { messages, model = "deepseek-chat", temperature, max_tokens } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      error: { message: "messages must be a non-empty array", type: "invalid_request_error", param: "messages" }
    });
  }

  try {
    const result = await deepseek.chat({ messages, model, temperature, max_tokens });
    return res.json(toOpenAIResponse(result, model));
  } catch (error) {
    const status = error.message === "DEEPSEEK_TOKEN is not configured" ? 503 : 502;
    return res.status(status).json({
      error: { message: error.message, type: "provider_error" }
    });
  }
});

export default router;
