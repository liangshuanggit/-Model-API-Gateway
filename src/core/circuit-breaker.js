export class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000;
    this.state = new Map();
  }

  get(name) {
    return this.state.get(name) || { failures: 0, status: 'closed' };
  }

  canRequest(name) {
    const item = this.get(name);
    if (item.status === 'open') {
      return Date.now() - item.openedAt > this.resetTimeout;
    }
    return true;
  }

  success(name) {
    this.state.set(name, { failures: 0, status: 'closed' });
  }

  failure(name) {
    const item = this.get(name);
    item.failures += 1;
    if (item.failures >= this.failureThreshold) {
      item.status = 'open';
      item.openedAt = Date.now();
    }
    this.state.set(name, item);
  }
}
