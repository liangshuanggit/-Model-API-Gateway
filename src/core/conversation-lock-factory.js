import { ConversationLock } from "./conversation-lock.js";
import { RedisConversationLock } from "./redis-conversation-lock.js";

export function createConversationLock(options = {}) {
  const driver = (process.env.CONVERSATION_STORE || "memory").toLowerCase();
  if (driver === "memory") return new ConversationLock();
  if (driver === "redis") {
    if (!options.redis) throw new Error("Redis conversation lock requires a redis client");
    return new RedisConversationLock(options.redis, options);
  }
  throw new Error(`Unsupported CONVERSATION_STORE: ${driver}. Supported stores: memory, redis`);
}
