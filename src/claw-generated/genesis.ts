import { Account, GenesisConfig } from './types';
import { readFileSync } from 'fs';

export function loadGenesisConfig(path: string): GenesisConfig {
  const configData = readFileSync(path, 'utf8');
  return JSON.parse(configData) as GenesisConfig;
}

export const defaultGenesisConfig: GenesisConfig = {
  chainId: 'clawchain',
  initialAccounts: [
    {
      address: '0x0123456789012345678901234567890123456789',
      balance: '1000000000000000000000'
    }
  ],
  networkParams: {
    blockTime: 10,
    maxBlockSize: 1000000,
    maxTransactionsPerBlock: 1000
  }
};