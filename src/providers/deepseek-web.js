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

  buildPayload({ messages = [], model = "deepseek-chat", temperature, max_tokens, top_p, stop }) {
    if (!this.token) throw new Error("DEEPSEEK_TOKEN is not configured");
    const payload = {
      chat_session_id: uuid(),
      parent_message_id: uuid(),
      prompt: messages.map((message) => `${message.role}: ${message.content}`).join("\n")
    };
    if (model) payload.model = model;
    if (temperature !== undefined) payload.temperature = temperature;
    if (max_tokens !== undefined) payload.max_tokens = max_tokens;
    if (top_p !== undefined) payload.top_p = top_p;
    if (stop !== undefined) payload.stop = stop;
    return payload;
  }

  async chat(options, requestOptions = {}) {
    const response = await this.client.post("/api/v0/chat/completion", this.buildPayload(options), {
      headers: { Authorization: `Bearer ${this.token}` },
      signal: requestOptions.signal
    });
    return response.data;
  }

  async *chatStream(options, requestOptions = {}) {
    const response = await this.client.post("/api/v0/chat/completion", this.buildPayload(options), {
      responseType: "stream",
      headers: { Authorization: `Bearer ${this.token}`, Accept: "text/event-stream" },
      signal: requestOptions.signal
    });
    let buffer = "";
    try {
      for await (const chunk of response.data) {
        buffer += chunk.toString("utf8");
        const parts = buffer.split(/\r?\n/);
        buffer = parts.pop() || "";
        for (const line of parts) {
          const value = line.startsWith("data:") ? line.slice(5).trim() : line.trim();
          if (!value || value === "[DONE]") continue;
          try { yield JSON.parse(value); } catch { yield { content: value }; }
        }
      }
      if (buffer.trim()) {
        const value = buffer.replace(/^data:\s*/, "").trim();
        if (value && value !== "[DONE]") {
          try { yield JSON.parse(value); } catch { yield { content: value }; }
        }
      }
    } finally {
      if (typeof response.data.destroy === "function") response.data.destroy();
    }
  }
}
