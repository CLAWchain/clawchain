import { GenesisConfig } from './genesis';

export interface ChainConfig {
  genesis: GenesisConfig;
  // Other chain configuration properties
}

export function getChainConfig(): ChainConfig {
  return {
    genesis: loadGenesisConfig()
  };
}