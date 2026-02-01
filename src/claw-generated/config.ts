import { GenesisConfig, DEFAULT_GENESIS_CONFIG } from './genesis-config';

let genesisConfig: GenesisConfig = DEFAULT_GENESIS_CONFIG;

// Load genesis config from environment variables or genesis.json
try {
  genesisConfig = {
    chainId: process.env.CHAIN_ID || genesisConfig.chainId,
    timestamp: parseInt(process.env.GENESIS_TIMESTAMP || String(genesisConfig.timestamp)),
    blockTime: parseInt(process.env.BLOCK_TIME || String(genesisConfig.blockTime)),
    blockSize: parseInt(process.env.BLOCK_SIZE || String(genesisConfig.blockSize)),
    initialAccounts: JSON.parse(process.env.INITIAL_ACCOUNTS || JSON.stringify(genesisConfig.initialAccounts)),
  };
} catch (err) {
  console.error('Error loading genesis config:', err);
}

export { genesisConfig };