import { Transaction } from '../transactions';

export class Mempool {
  private transactions: Transaction[] = [];

  addTransaction(transaction: Transaction): boolean {
    // Verify the transaction signature before adding to the mempool
    if (!transaction.verifySignature()) {
      return false;
    }

    this.transactions.push(transaction);
    return true;
  }

  getTransactions(): Transaction[] {
    return this.transactions;
  }
}