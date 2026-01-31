import { Counter, Gauge, Registry } from 'prom-client';

const registry = new Registry();

// Block metrics
export const blocksProduced = new Counter({
  name: 'blocks_produced_total',
  help: 'Total number of blocks produced',
  registers: [registry]
});

export const blockProductionRate = new Gauge({
  name: 'block_production_rate',
  help: 'Blocks produced per second',
  registers: [registry]
});

export const averageBlockFinalityTime = new Gauge({
  name: 'average_block_finality_time',
  help: 'Average time for a block to reach finality (seconds)',
  registers: [registry]
});

// Transaction metrics
export const transactionsProcessed = new Counter({
  name: 'transactions_processed_total',
  help: 'Total number of transactions processed',
  registers: [registry]
});

export const transactionThroughput = new Gauge({
  name: 'transaction_throughput',
  help: 'Transactions processed per second',
  registers: [registry]
});

export const contractDeploymentSuccess = new Gauge({
  name: 'contract_deployment_success_rate',
  help: 'Percentage of successful contract deployments',
  registers: [registry]
});

export const contractExecutionSuccess = new Gauge({
  name: 'contract_execution_success_rate',
  help: 'Percentage of successful contract executions',
  registers: [registry]
});

// Peer metrics
export const peerConnections = new Gauge({
  name: 'peer_connections',
  help: 'Number of active peer connections',
  registers: [registry]
});

export const peerReputation = new Gauge({
  name: 'peer_reputation',
  help: 'Average peer reputation score',
  registers: [registry]
});

export const networkBandwidthUtilization = new Gauge({
  name: 'network_bandwidth_utilization',
  help: 'Percentage of available network bandwidth in use',
  registers: [registry]
});

export const getMetrics = () => registry.metrics();