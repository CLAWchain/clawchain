export interface GenesisAllocation {
  address: string;
  amount: number;
}

export interface GenesisConfig {
  chainId: string;
  allocations: GenesisAllocation[];
  protocolParams: {
    blockTime: number; // seconds
    blockSize: number; // bytes
    minTxFee: number; // native token
  };
}