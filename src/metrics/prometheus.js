import client from 'prom-client';

export const registry = new client.Registry();

export const requestCounter = new client.Counter({
  name:'gateway_requests_total',
  help:'Total gateway requests',
  labelNames:['model','status']
});

export const latencyHistogram = new client.Histogram({
  name:'gateway_request_duration_ms',
  help:'Gateway request latency',
  buckets:[50,100,300,500,1000,3000]
});

registry.registerMetric(requestCounter);
registry.registerMetric(latencyHistogram);

export async function metrics(){
  return registry.metrics();
}
