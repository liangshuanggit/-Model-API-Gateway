export class RedisConversationStore {
  constructor(redis, { ttlMs = 24 * 60 * 60 * 1000, prefix = "model-api:conversation:" } = {}) {
    if (!redis) throw new Error("Redis client is required");
    this.redis = redis;
    this.ttlMs = ttlMs;
    this.prefix = prefix;
  }
  key(id) { return `${this.prefix}${id}`; }
  async get(id) {
    const raw = await this.redis.get(this.key(id));
    if (!raw) return undefined;
    try { return JSON.parse(raw); } catch { await this.delete(id); return undefined; }
  }
  async set(id, value) {
    const ttlSeconds = Math.max(1, Math.ceil(this.ttlMs / 1000));
    await this.redis.set(this.key(id), JSON.stringify(value), { EX: ttlSeconds });
    return value;
  }
  async update(id, patch) {
    const current = await this.get(id);
    if (!current) return undefined;
    return this.set(id, { ...current, ...patch });
  }
  async delete(id) { return this.redis.del(this.key(id)); }
}
