import { MemoryConversationStore } from "./memory-conversation-store.js";
import { RedisConversationStore } from "./redis-conversation-store.js";

export function createConversationStore(options = {}) {
  const driver = (process.env.CONVERSATION_STORE || "memory").toLowerCase();
  if (driver === "memory") return new MemoryConversationStore(options);
  if (driver === "redis") {
    if (!options.redis) throw new Error("Redis conversation store requires a redis client");
    return new RedisConversationStore(options.redis, options);
  }
  throw new Error(`Unsupported CONVERSATION_STORE: ${driver}. Supported stores: memory, redis`);
}
