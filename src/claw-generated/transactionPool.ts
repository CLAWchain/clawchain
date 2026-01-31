import { Transaction } from './transaction';

export class TransactionPool {
  private transactions: Transaction[] = [];

  public addTransaction(transaction: Transaction): boolean {
    // Verify the transaction's signature before adding it to the pool
    if (transaction.verifySignature()) {
      this.transactions.push(transaction);
      return true;
    }
    return false;
  }

  public getTransactions(): Transaction[] {
    return this.transactions;
  }
}