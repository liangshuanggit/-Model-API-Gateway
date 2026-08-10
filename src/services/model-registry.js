import fs from "fs";
import path from "path";

const file = path.resolve("config/models.json");

export function listModels(){
  const models = JSON.parse(fs.readFileSync(file,"utf8"));
  return Object.keys(models);
}

export function openAIModels(){
  return listModels().map(id=>({
    id,
    object:"model",
    created:Math.floor(Date.now()/1000),
    owned_by:"gateway"
  }));
}
