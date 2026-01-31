import { Transaction } from './transaction';

export async function getTransactions(): Promise<Transaction[]> {
  // Fetch transactions from the transaction pool or database
  return [
    {
      hash: '0x1234567890abcdef',
      from: '0x0123456789012345678901234567890123456789',
      to: '0x9876543210fedcba9876543210fedcba98765432',
      amount: 10,
      status: 'confirmed'
    },
    {
      hash: '0xfedcba0987654321fedcba0987654321fedcba09',
      from: '0x9876543210fedcba9876543210fedcba98765432',
      to: '0x0123456789012345678901234567890123456789',
      amount: 5,
      status: 'pending'
    }
  ];
}