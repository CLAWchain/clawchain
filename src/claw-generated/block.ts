import { Transaction } from './transaction';

export class Block {
  hash: string;
  previousHash: string;
  timestamp: number;
  transactions: Transaction[];
  nonce: number;

  constructor(
    previousHash: string,
    timestamp: number,
    transactions: Transaction[],
    nonce: number
  ) {
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.nonce = nonce;
    this.hash = this.calculateHash();
  }

  calculateHash(): string {
    // Implement hash calculation logic
    return '';
  }

  validateBlock(): boolean {
    // Implement block validation logic
    return true;
  }
}