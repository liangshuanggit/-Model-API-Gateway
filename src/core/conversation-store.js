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
    return session;
  }

  set(key, value) {
    if (this.sessions.size >= this.maxSize && !this.sessions.has(key)) {
      const oldest = this.sessions.keys().next().value;
      if (oldest !== undefined) this.sessions.delete(oldest);
    }
    const session = { ...value, expiresAt: Date.now() + this.ttlMs };
    this.sessions.set(key, session);
    return session;
  }

  delete(key) { return this.sessions.delete(key); }
  clear() { this.sessions.clear(); }
}
