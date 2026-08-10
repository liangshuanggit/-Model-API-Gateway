import { normalizeUsage } from "./openai-usage.js";

export function toOpenAIResponse(data, model = "deepseek-chat") {
  const content = data?.answer ?? data?.content ?? "";
  return {
    id: `chatcmpl-${Date.now()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }],
    usage: normalizeUsage(data?.usage)
  };
}

export function toOpenAIChunk(data, model = "deepseek-chat", id = `chatcmpl-${Date.now()}`, options = {}) {
  const content = data?.answer ?? data?.content ?? "";
  const delta = options.includeRole ? { role: "assistant", content } : { content };
  return {
    id, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model,
    choices: [{ index: 0, delta, finish_reason: options.finishReason ?? null }]
  };
}

export function toOpenAIUsageChunk(usage = {}, model = "deepseek-chat", id = `chatcmpl-${Date.now()}`) {
  return {
    id, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model, choices: [],
    usage: normalizeUsage(usage)
  };
}

export function writeSSE(res, payload) { res.write(`data: ${JSON.stringify(payload)}\n\n`); }
export function writeDone(res) { res.write("data: [DONE]\n\n"); }
