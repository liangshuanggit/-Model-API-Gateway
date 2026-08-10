import test from "node:test";
import assert from "node:assert/strict";
import { toOpenAIChunk } from "../src/adapters/openai-format.js";

test("creates an OpenAI-compatible streaming chunk", () => {
  const chunk = toOpenAIChunk({ content: "hello" }, "deepseek-chat", "chatcmpl-test");
  assert.equal(chunk.id, "chatcmpl-test");
  assert.equal(chunk.object, "chat.completion.chunk");
  assert.equal(chunk.model, "deepseek-chat");
  assert.equal(chunk.choices[0].delta.role, "assistant");
  assert.equal(chunk.choices[0].delta.content, "hello");
});
