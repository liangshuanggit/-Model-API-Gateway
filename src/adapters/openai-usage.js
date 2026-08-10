export function normalizeUsage(usage = {}) {
  const promptTokens = Number(usage.prompt_tokens ?? usage.input_tokens ?? 0) || 0;
  const completionTokens = Number(usage.completion_tokens ?? usage.output_tokens ?? 0) || 0;
  const totalTokens = Number(usage.total_tokens ?? promptTokens + completionTokens) || promptTokens + completionTokens;
  return { prompt_tokens: promptTokens, completion_tokens: completionTokens, total_tokens: totalTokens };
}
