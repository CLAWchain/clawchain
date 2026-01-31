import { Transaction } from './Transaction';

export async function getTransactions(): Promise<Transaction[]> {
  return [
    {
      hash: '0x1234567890abcdef',
      from: '0x0123456789012345678901234567890123456789',
      to: '0x9876543210fedcba9876543210fedcba98765432',
      amount: 10,
      status: 'confirmed',
      timestamp: 1618326000,
      gasUsed: 21000,
      gasPrice: 10000000000,
      nonce: 5,
      data: '0x0123456789abcdef'
    },
    {
      hash: '0xfedcba0987654321fedcba0987654321fedcba09',
      from: '0x9876543210fedcba9876543210fedcba98765432',
      to: '0x0123456789012345678901234567890123456789',
      amount: 5,
      status: 'pending',
      timestamp: 1618325800,
      gasUsed: 21000,
      gasPrice: 10000000000,
      nonce: 4,
      data: '0xfedcba0987654321'
    }
  ];
}