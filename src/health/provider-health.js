export class ProviderHealthChecker {
  constructor() {
    this.status = new Map();
  }

  set(provider, healthy) {
    this.status.set(provider, {
      healthy,
      updatedAt: Date.now()
    });
  }

  isHealthy(provider) {
    const item = this.status.get(provider);
    if (!item) return true;
    return item.healthy;
  }

  all() {
    return Object.fromEntries(this.status);
  }
}

export const providerHealth = new ProviderHealthChecker();
