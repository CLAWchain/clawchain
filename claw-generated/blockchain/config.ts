import { GenesisConfig } from './genesis';

export const CHAIN_ID = 'claw-chain';

export const GENESIS_CONFIG: GenesisConfig = {
  chainId: CHAIN_ID,
  initialTokenAllocations: {
    '0x1234567890123456789012345678901234567890': 1000000,
    '0x0987654321098765432109876543210987654321': 500000
  },
  initialValidators: [
    '0x1234567890123456789012345678901234567890',
    '0x0987654321098765432109876543210987654321'
  ],
  otherSettings: {
    initialState: {
      '0x1234567890123456789012345678901234567890': {
        balance: 100000,
        isValidator: true
      },
      '0x0987654321098765432109876543210987654321': {
        balance: 50000,
        isValidator: true
      },
      '0x9876543210987654321098765432109876543210': {
        balance: 1000000
      }
    }
  }
};