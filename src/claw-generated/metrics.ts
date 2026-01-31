import { Counter, Gauge, Registry, collectDefaultMetrics } from 'prom-client';

// Initialize Prometheus registry
const registry = new Registry();

// Register default Node.js metrics
collectDefaultMetrics({ register: registry });

// Block metrics
export const blocksCreated = new Counter({
  name: 'blocks_created',
  help: 'Total number of blocks created',
  registers: [registry],
});

export const blockTime = new Gauge({
  name: 'block_time',
  help: 'Time taken to produce a block (seconds)',
  registers: [registry],
});

export const blockSize = new Gauge({
  name: 'block_size',
  help: 'Size of the latest block (bytes)',
  registers: [registry],
});

// Transaction metrics
export const transactionsProcessed = new Counter({
  name: 'transactions_processed',
  help: 'Total number of transactions processed',
  registers: [registry],
});

export const transactionPoolSize = new Gauge({
  name: 'transaction_pool_size',
  help: 'Number of transactions in the pool',
  registers: [registry],
});

export const transactionGasUsage = new Gauge({
  name: 'transaction_gas_usage',
  help: 'Total gas used by processed transactions',
  registers: [registry],
});

// Peer network metrics
export const connectedPeers = new Gauge({
  name: 'connected_peers',
  help: 'Number of connected peers',
  registers: [registry],
});

export const peerChurn = new Counter({
  name: 'peer_churn',
  help: 'Total number of peers connected/disconnected',
  registers: [registry],
});

export const messageLantency = new Gauge({
  name: 'message_latency',
  help: 'Average latency of network messages (milliseconds)',
  registers: [registry],
});

// Resource utilization metrics
export const cpuUsage = new Gauge({
  name: 'cpu_usage',
  help: 'CPU usage percentage',
  registers: [registry],
});

export const memoryUsage = new Gauge({
  name: 'memory_usage',
  help: 'Memory usage (bytes)',
  registers: [registry],
});

export const diskUsage = new Gauge({
  name: 'disk_usage',
  help: 'Disk usage percentage',
  registers: [registry],
});

export default registry;