export interface GenesisConfig {
  chainId: string;
  initialAllocation: { [address: string]: number };
  blockParams: {
    difficulty: number;
    gasLimit: number;
  };
}

export function loadGenesisConfig(): GenesisConfig {
  // TODO: Load genesis config from file
  return {
    chainId: 'claw-chain-1',
    initialAllocation: {
      '0x1234567890123456789012345678901234567890': 1000000,
      '0x0987654321098765432109876543210987654321': 500000
    },
    blockParams: {
      difficulty: 1000000,
      gasLimit: 8000000
    }
  };
}