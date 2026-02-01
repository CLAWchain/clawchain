import { Transaction } from './transaction';

export class Mempool {
  private transactions: Transaction[] = [];

  addTransaction(tx: Transaction): boolean {
    if (tx.verifySignature()) {
      this.transactions.push(tx);
      return true;
    }
    return false;
  }

  getTransactions(): Transaction[] {
    return this.transactions;
  }
}