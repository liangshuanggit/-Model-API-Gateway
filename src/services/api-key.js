import db from "../storage/sqlite.js";
import crypto from "crypto";

export function createApiKey(userId){
 const key = "gw-" + crypto.randomBytes(24).toString("hex");
 db.prepare("INSERT INTO api_keys(user_id,key) VALUES(?,?)")
   .run(userId,key);
 return key;
}

export function validateApiKey(key){
 return !!db.prepare("SELECT id FROM api_keys WHERE key=? AND enabled=1")
   .get(key);
}
