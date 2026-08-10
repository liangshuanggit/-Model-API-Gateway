import test from "node:test";
import assert from "node:assert/strict";
import { normalizeUsage } from "../src/adapters/openai-usage.js";

test("normalizes OpenAI usage fields", () => {
  assert.deepEqual(normalizeUsage({
    input_tokens: 10,
    output_tokens: 5
  }), {
    prompt_tokens: 10,
    completion_tokens: 5,
    total_tokens: 15
  });
});

test("keeps OpenAI usage names", () => {
  assert.deepEqual(normalizeUsage({
    prompt_tokens: 3,
    completion_tokens: 7,
    total_tokens: 10
  }), {
    prompt_tokens: 3,
    completion_tokens: 7,
    total_tokens: 10
  });
});
