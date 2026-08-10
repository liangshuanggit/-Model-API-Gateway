import { providerHealth } from '../health/provider-health.js';

export function selectProvider(modelConfig) {
  const providers = [
    modelConfig.provider,
    ...(modelConfig.fallback || [])
  ];

  for (const provider of providers) {
    if (providerHealth.isHealthy(provider)) {
      return provider;
    }
  }

  throw new Error('No healthy provider available');
}
