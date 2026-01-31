import { Counter, Gauge, Registry } from 'prom-client';

const registry = new Registry();

// Blockchain metrics
export const blockProduced = new Counter({
  name: 'claw_blocks_produced',
  help: 'Total number of blocks produced',
  registers: [registry]
});

export const transactionsProcessed = new Counter({
  name: 'claw_transactions_processed',
  help: 'Total number of transactions processed',
  registers: [registry]
});

export const peersConnected = new Gauge({
  name: 'claw_peers_connected',
  help: 'Number of peers currently connected',
  registers: [registry]
});

export const chainHeight = new Gauge({
  name: 'claw_chain_height',
  help: 'Current height of the blockchain',
  registers: [registry]
});

export const getMetricsRegistry = () => registry;