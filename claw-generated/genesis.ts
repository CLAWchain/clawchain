// Genesis block configuration

export interface GenesisConfig {
  chainId: number;
  blockReward: number;
  transactionFee: number;
  initialAllocations: {
    [address: string]: number;
  };
}

export const GENESIS_CONFIG: GenesisConfig = {
  chainId: 1,
  blockReward: 5,
  transactionFee: 0.01,
  initialAllocations: {
    '0x1234567890123456789012345678901234567890': 1000000,
    '0x0987654321098765432109876543210987654321': 500000
  }
};