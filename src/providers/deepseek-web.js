import axios from "axios";
import { v4 as uuid } from "uuid";

export class DeepSeekWebClient {
  constructor(options = {}) {
    this.client = axios.create({
      baseURL: "https://chat.deepseek.com",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    this.token = options.token;
  }

  async chat(messages) {
    const response = await this.client.post(
      "/api/v0/chat/completion",
      {
        chat_session_id: uuid(),
        parent_message_id: uuid(),
        prompt: messages.map(m => `${m.role}: ${m.content}`).join("\n")
      },
      {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      }
    );

    return response.data;
  }
}
