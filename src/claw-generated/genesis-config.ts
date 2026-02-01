import { AccountInfo } from '../types';

export interface GenesisConfig {
  chainId: string;
  timestamp: number;
  blockTime: number;
  blockSize: number;
  initialAccounts: AccountInfo[];
}

export const DEFAULT_GENESIS_CONFIG: GenesisConfig = {
  chainId: 'clawchain-1',
  timestamp: Date.now(),
  blockTime: 5000, // 5 seconds
  blockSize: 1024 * 1024, // 1 MB
  initialAccounts: [
    { address: 'claw1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq', balance: 1000000000 },
    { address: 'claw1pppppppppppppppppppppppppppppppp', balance: 500000000 },
  ],
};