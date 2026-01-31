import { MetricsCollector } from './metrics';

const metricsCollector = new MetricsCollector();

setInterval(() => {
  const nodeStats = metricsCollector.getNodeStats();
  console.log('Current node stats:', nodeStats);
}, 10000);