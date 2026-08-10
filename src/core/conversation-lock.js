export class ConversationLock {
  constructor() { this.locks = new Map(); }
  async run(key, fn) {
    if (!key) return fn();
    const previous = this.locks.get(key) || Promise.resolve();
    let release;
    const current = new Promise((resolve) => { release = resolve; });
    this.locks.set(key, current);
    await previous;
    try { return await fn(); }
    finally { release(); if (this.locks.get(key) === current) this.locks.delete(key); }
  }
}
