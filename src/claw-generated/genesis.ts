import { GenesisAllocation, GenesisConfig } from './types';

export const CHAIN_ID = 'clawchain-1';

export const GENESIS_ALLOCATIONS: GenesisAllocation[] = [
  {
    address: '0x123456789abcdef0123456789abcdef01234567',
    amount: 1000000,
  },
  {
    address: '0x0987654321fedcba0987654321fedcba0987654',
    amount: 500000,
  },
];

export const GENESIS_CONFIG: GenesisConfig = {
  chainId: CHAIN_ID,
  allocations: GENESIS_ALLOCATIONS,
  protocolParams: {
    blockTime: 10, // seconds
    blockSize: 1000000, // bytes
    minTxFee: 0.001, // native token
  },
};