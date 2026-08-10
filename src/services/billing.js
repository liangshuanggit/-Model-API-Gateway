import db from "../storage/sqlite.js";

export function recordUsage({apiKey,model,tokens=0}){
 db.prepare(
  "INSERT INTO usage_logs(api_key,model,tokens) VALUES(?,?,?)"
 ).run(apiKey,model,tokens);
}

export function getUsage(apiKey){
 return db.prepare(
  "SELECT COUNT(*) requests,SUM(tokens) tokens FROM usage_logs WHERE api_key=?"
 ).get(apiKey);
}
