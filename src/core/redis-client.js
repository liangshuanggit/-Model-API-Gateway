import { createClient } from "redis";

export const redisEnabled = (process.env.CONVERSATION_STORE || "memory").toLowerCase() === "redis";
export const redisClient = redisEnabled
  ? createClient({ url: process.env.REDIS_URL || "redis://127.0.0.1:6379" })
  : null;

export async function connectRedis() {
  if (!redisClient || redisClient.isOpen) return;
  await redisClient.connect();
}

export async function disconnectRedis() {
  if (redisClient?.isOpen) await redisClient.quit();
}
