import { Transaction } from './transaction';

export class Block {
  private transactions: Transaction[] = [];

  public addTransaction(transaction: Transaction): boolean {
    // Verify the transaction's signature before adding it to the block
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