import { Transaction, validateTransaction } from './transaction';
import { Account } from './account';

export class TransactionPool {
  private transactions: Transaction[] = [];

  addTransaction(tx: Transaction, accounts: Account[]): boolean {
    const senderAccount = accounts.find(a => a.address === tx.inputs[0].address);
    if (!senderAccount || tx.nonce <= senderAccount.nonce) {
      return false;
    }

    if (!validateTransaction(tx, accounts)) {
      return false;
    }

    this.transactions.push(tx);
    return true;
  }

  getTransactions(): Transaction[] {
    return this.transactions;
  }
}