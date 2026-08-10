import { randomUUID } from "node:crypto";

export class RedisConversationLock {
  constructor(redis, { ttlMs = 120000, prefix = "model-api:conversation-lock:" } = {}) {
    if (!redis) throw new Error("Redis client is required");
    this.redis = redis;
    this.ttlMs = ttlMs;
    this.prefix = prefix;
  }
  key(id) { return `${this.prefix}${id}`; }
  async acquire(key) {
    const token = randomUUID();
    const ok = await this.redis.set(this.key(key), token, { NX: true, PX: this.ttlMs });
    return ok === "OK" ? token : null;
  }
  async release(key, token) {
    const script = "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end";
    return this.redis.eval(script, { keys: [this.key(key)], arguments: [token] });
  }
  async run(key, fn, { waitMs = 30000, retryMs = 100 } = {}) {
    if (!key) return fn();
    const deadline = Date.now() + waitMs;
    let token;
    while (!(token = await this.acquire(key))) {
      if (Date.now() >= deadline) throw new Error("Conversation lock timeout");
      await new Promise((resolve) => setTimeout(resolve, retryMs));
    }
    try { return await fn(); }
    finally { await this.release(key, token); }
  }
}
