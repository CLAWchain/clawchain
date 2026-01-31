import { Counter, Gauge, Histogram, register } from 'prom-client';

// Initialize Prometheus metrics
export const blockProductionCounter = new Counter({
  name: 'block_production_total',
  help: 'Total number of blocks produced'
});

export const transactionThroughputGauge = new Gauge({
  name: 'transaction_throughput',
  help: 'Current transaction throughput (transactions per second)'
});

export const peerCountGauge = new Gauge({
  name: 'peer_count',
  help: 'Number of connected peers'
});

export const consensusStatusGauge = new Gauge({
  name: 'consensus_status',
  help: 'Current consensus status (0 = unhealthy, 1 = healthy)'
});

export const registerMetrics = () => {
  register.registerMetric(blockProductionCounter);
  register.registerMetric(transactionThroughputGauge);
  register.registerMetric(peerCountGauge);
  register.registerMetric(consensusStatusGauge);
};