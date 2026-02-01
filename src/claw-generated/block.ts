import { Transaction } from './transaction';

export class Block {
  transactions: Transaction[];
  previousHash: string;
  hash: string;

  constructor(transactions: Transaction[], previousHash: string) {
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash(): string {
    // TODO: Implement hash calculation
    return 'placeholder-hash';
  }

  verifyTransactions(): boolean {
    for (const tx of this.transactions) {
      if (!tx.verifySignature()) {
        return false;
      }
    }
    return true;
  }
}