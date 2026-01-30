import { Address, Balance } from '../types';

export interface GenesisConfig {
  chainId: string;
  initialAllocations: { [address: string]: Balance };
  // Add other genesis block parameters as needed
}

export const defaultGenesisConfig: GenesisConfig = {
  chainId: 'clawchain-1',
  initialAllocations: {
    '0x1234567890123456789012345678901234567890': 1000000,
    '0x0987654321098765432109876543210987654321': 500000
  }
}

export function loadGenesisConfig(configPath: string): GenesisConfig {
  // Load genesis config from file or other source
  // Validate the config and return it
  return defaultGenesisConfig;
}