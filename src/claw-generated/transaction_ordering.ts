import { Transaction } from './transaction';
import { randomBytes } from 'crypto';

export class TransactionOrdering {
  private transactionPool: Transaction[] = [];

  addTransaction(tx: Transaction): void {
    this.transactionPool.push(tx);
  }

  processTransactions(): Transaction[] {
    // Implement fair ordering logic
    this.transactionPool.sort((a, b) => {
      // Sort by random value to achieve blind auction ordering
      const aRandom = parseInt(randomBytes(4).toString('hex'), 16);
      const bRandom = parseInt(randomBytes(4).toString('hex'), 16);
      return aRandom - bRandom;
    });

    return this.transactionPool;
  }
}