import axios from "axios";
import { v4 as uuid } from "uuid";

export class DeepSeekWebClient {
  constructor(options = {}) {
    this.client = axios.create({
      baseURL: options.baseURL || "https://chat.deepseek.com",
      headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
      timeout: options.timeout || 60000
    });
    this.token = options.token;
  }

  async chat({ messages = [], model = "deepseek-chat", temperature, max_tokens }) {
    if (!this.token) throw new Error("DEEPSEEK_TOKEN is not configured");
    const payload = {
      chat_session_id: uuid(),
      parent_message_id: uuid(),
      prompt: messages.map((message) => `${message.role}: ${message.content}`).join("\n")
    };
    if (model) payload.model = model;
    if (temperature !== undefined) payload.temperature = temperature;
    if (max_tokens !== undefined) payload.max_tokens = max_tokens;
    const response = await this.client.post("/api/v0/chat/completion", payload, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    return response.data;
  }
}
