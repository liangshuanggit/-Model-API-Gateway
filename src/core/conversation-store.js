export class ConversationStore {
  constructor({ ttlMs = 24 * 60 * 60 * 1000, maxSize = 10000 } = {}) {
    this.ttlMs = ttlMs;
    this.maxSize = maxSize;
    this.sessions = new Map();
  }

  get(key) {
    const session = this.sessions.get(key);
    if (!session) return undefined;
    if (session.expiresAt <= Date.now()) {
      this.sessions.delete(key);
      return undefined;
    }
    this.sessions.delete(key);
    this.sessions.set(key, session);
    return session;
  }

  set(key, value) {
    if (this.sessions.has(key)) this.sessions.delete(key);
    while (this.sessions.size >= this.maxSize) {
      const oldest = this.sessions.keys().next().value;
      if (oldest === undefined) break;
      this.sessions.delete(oldest);
    }
    const session = { ...value, expiresAt: Date.now() + this.ttlMs };
    this.sessions.set(key, session);
    return session;
  }

  update(key, patch) {
    const current = this.get(key);
    if (!current) return undefined;
    return this.set(key, { ...current, ...patch });
  }

  delete(key) { return this.sessions.delete(key); }
  clear() { this.sessions.clear(); }
  size() { return this.sessions.size; }
}
