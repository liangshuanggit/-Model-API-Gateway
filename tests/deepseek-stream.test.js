import test from "node:test";
import assert from "node:assert/strict";
import { DeepSeekWebClient } from "../src/providers/deepseek-web.js";

test("parses newline-delimited DeepSeek SSE JSON chunks", async () => {
  const client = new DeepSeekWebClient({ token: "test-token" });
  const chunks = [Buffer.from('data: {"content":"hel"}\n'), Buffer.from('data: {"content":"lo"}\n'), Buffer.from('data: [DONE]\n')];
  client.client.post = async () => ({ data: (async function* () { for (const chunk of chunks) yield chunk; })() });

  const result = [];
  for await (const chunk of client.chatStream({ messages: [{ role: "user", content: "hi" }] })) result.push(chunk);

  assert.deepEqual(result, [{ content: "hel" }, { content: "lo" }]);
});

test("supports non-JSON stream data", async () => {
  const client = new DeepSeekWebClient({ token: "test-token" });
  client.client.post = async () => ({ data: (async function* () { yield Buffer.from("data: hello\\n"); })() });

  const result = [];
  for await (const chunk of client.chatStream({ messages: [{ role: "user", content: "hi" }] })) result.push(chunk);

  assert.deepEqual(result, [{ content: "hello" }]);
});
