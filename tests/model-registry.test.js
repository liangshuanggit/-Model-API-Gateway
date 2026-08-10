import test from "node:test";
import assert from "node:assert/strict";
import { openAIModel } from "../src/services/model-registry.js";

test("returns OpenAI model object for registered model", () => {
  const model = openAIModel("deepseek-chat");
  assert.equal(model?.object, "model");
  assert.equal(model?.id, "deepseek-chat");
});

test("returns null for unknown model", () => {
  assert.equal(openAIModel("unknown-model"), null);
});
