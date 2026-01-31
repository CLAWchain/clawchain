// transaction_receipt.ts

import { Log, Bloom } from './types';

export interface TransactionReceipt {
  status: boolean;
  gasUsed: number;
  logs: Log[];
  bloomFilter: Bloom;
}

export function createTransactionReceipt(
  status: boolean,
  gasUsed: number,
  logs: Log[],
  bloomFilter: Bloom
): TransactionReceipt {
  return {
    status,
    gasUsed,
    logs,
    bloomFilter
  };
}