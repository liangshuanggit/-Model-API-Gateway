export function toOpenAIResponse(data, model = "deepseek-chat") {
  const content = data?.answer ?? data?.content ?? "";
  const usage = data?.usage || {};

  return {
    id: `chatcmpl-${Date.now()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [{
      index: 0,
      message: { role: "assistant", content },
      finish_reason: "stop"
    }],
    usage: {
      prompt_tokens: usage.prompt_tokens ?? 0,
      completion_tokens: usage.completion_tokens ?? 0,
      total_tokens: usage.total_tokens ?? 0
    }
  };
}
