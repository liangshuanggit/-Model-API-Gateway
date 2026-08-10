import { MemoryConversationStore } from "./memory-conversation-store.js";

export function createConversationStore(options = {}) {
  const driver = (process.env.CONVERSATION_STORE || "memory").toLowerCase();
  if (driver !== "memory") {
    throw new Error(`Unsupported CONVERSATION_STORE: ${driver}. Supported stores: memory`);
  }
  return new MemoryConversationStore(options);
}
