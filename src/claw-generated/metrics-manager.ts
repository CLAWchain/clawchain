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

export const getMetrics = () => registry.metrics();