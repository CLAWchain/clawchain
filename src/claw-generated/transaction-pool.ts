import { AbstractAccount } from './abstract-account';
import { Transaction } from './transaction';

export class TransactionPool {
  private transactions: Transaction[] = [];

  addTransaction(tx: Transaction, account: AbstractAccount): boolean {
    // Check if the transaction is valid
    if (!account.validateTransaction(tx)) {
      return false;
    }

    // Update the account nonce and balance
    account.nonce++;
    account.balance -= BigInt(tx.value);

    // Add the transaction to the pool
    this.transactions.push(tx);
    return true;
  }

  getTransactions(): Transaction[] {
    return this.transactions;
  }

  clearPool(): void {
    this.transactions = [];
  }
}