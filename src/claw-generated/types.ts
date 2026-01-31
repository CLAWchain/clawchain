export interface Account {
  address: string;
  balance: string;
}

export interface GenesisConfig {
  chainId: string;
  initialAccounts: Account[];
  networkParams: {
    blockTime: number;
    maxBlockSize: number;
    maxTransactionsPerBlock: number;
  };
}