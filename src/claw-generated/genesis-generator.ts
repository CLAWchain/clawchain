import { GenesisConfig } from './genesis-config';
import { BlockState, AccountState } from '../types';

export function generateGenesisBlock(config: GenesisConfig): BlockState {
  const accounts: AccountState = {};
  for (const { address, balance } of config.initialAccounts) {
    accounts[address] = { balance };
  }

  return {
    header: {
      chainId: config.chainId,
      timestamp: config.timestamp,
      blockNumber: 0,
      parentHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    },
    accounts,
  };
}