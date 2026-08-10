import test from "node:test";
import assert from "node:assert/strict";
import { toOpenAIResponse } from "../src/adapters/openai-format.js";

test("converts a provider answer to OpenAI chat completion format", () => {
  const result = toOpenAIResponse({ answer: "hello" });

  assert.equal(result.object, "chat.completion");
  assert.equal(result.choices[0].message.role, "assistant");
  assert.equal(result.choices[0].message.content, "hello");
  assert.equal(result.choices[0].finish_reason, "stop");
  assert.equal(typeof result.id, "string");
  assert.equal(typeof result.created, "number");
});

test("accepts provider content fallback", () => {
  const result = toOpenAIResponse({ content: "fallback" });
  assert.equal(result.choices[0].message.content, "fallback");
});
