import test from "node:test";
import assert from "node:assert/strict";
import { normalizeUsage } from "../src/adapters/openai-usage.js";

test("normalizes provider response usage before OpenAI response output", () => {
  const providerUsage = {
    input_tokens: "12",
    output_tokens: "8"
  };

  assert.deepEqual(normalizeUsage(providerUsage), {
    prompt_tokens: 12,
    completion_tokens: 8,
    total_tokens: 20
  });
});

test("keeps zero usage stable for streaming fallback", () => {
  assert.deepEqual(normalizeUsage(), {
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0
  });
});
