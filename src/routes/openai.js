import express from "express";
import { DeepSeekWebClient } from "../providers/deepseek-web.js";
import { toOpenAIResponse } from "../adapters/openai-format.js";

const router = express.Router();

const deepseek = new DeepSeekWebClient({
  token: process.env.DEEPSEEK_TOKEN
});

router.post("/v1/chat/completions", async (req, res) => {
  try {
    const result = await deepseek.chat(req.body.messages || []);
    res.json(toOpenAIResponse(result));
  } catch (error) {
    res.status(500).json({
      error: {
        message: error.message
      }
    });
  }
});

export default router;
