import fs from "node:fs";
import path from "node:path";

const file = path.resolve("config/models.json");

export function listModels() {
  const models = JSON.parse(fs.readFileSync(file, "utf8"));
  return Object.keys(models);
}

export function hasModel(id) {
  return listModels().includes(id);
}

export function openAIModels() {
  const created = Math.floor(Date.now() / 1000);
  return listModels().map((id) => ({ id, object: "model", created, owned_by: "gateway" }));
}

export function openAIModel(id) {
  if (!hasModel(id)) return null;
  return { id, object: "model", created: Math.floor(Date.now() / 1000), owned_by: "gateway" };
}
