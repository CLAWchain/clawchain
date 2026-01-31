import { Transaction } from './Transaction';

export class Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  prevHash: string;
  hash: string;

  constructor(
    index: number,
    timestamp: number,
    transactions: Transaction[],
    prevHash: string,
    hash: string
  ) {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.prevHash = prevHash;
    this.hash = hash;
  }

  validate(): boolean {
    // Validate block structure and transactions
    return true;
  }
}