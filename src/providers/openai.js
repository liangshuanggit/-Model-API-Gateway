import { BaseProvider } from './base.js';
import axios from 'axios';

export class OpenAIProvider extends BaseProvider {
  constructor(config={}) {
    super();
    this.client = axios.create({
      baseURL: config.baseURL || 'https://api.openai.com/v1',
      headers: { Authorization: `Bearer ${config.apiKey || process.env.OPENAI_API_KEY}` }
    });
  }

  async chat(messages, options={}) {
    const {data}=await this.client.post('/chat/completions',{
      model: options.model || 'gpt-4o-mini',
      messages
    });
    return data;
  }
}
