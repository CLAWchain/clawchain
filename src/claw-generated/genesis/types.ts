// src/claw-generated/genesis/types.ts

export interface GenesisAllocation {
  address: string;
  amount: number;
}

export interface GenesisConfig {
  chainId: string;
  initialAllocations: GenesisAllocation[];
  blockTime: number;
  difficulty: number;
  blockReward: number;
}