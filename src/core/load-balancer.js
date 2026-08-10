export class LoadBalancer {
  constructor() {
    this.counters = {};
  }

  roundRobin(providers = []) {
    if (!providers.length) return null;
    const key = providers.map(p => p.name || p).join(',');
    this.counters[key] = (this.counters[key] || 0) + 1;
    return providers[this.counters[key] % providers.length];
  }

  weighted(providers = []) {
    const total = providers.reduce((sum, p) => sum + (p.weight || 1), 0);
    let value = Math.random() * total;
    for (const provider of providers) {
      value -= provider.weight || 1;
      if (value <= 0) return provider;
    }
    return providers[0] || null;
  }
}
