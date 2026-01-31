import { Account } from './Account';
import { Transaction } from './Transaction';

export class WalletManager {
  private accounts: Map<string, Account> = new Map();

  getAccount(address: string): Account {
    if (!this.accounts.has(address)) {
      this.accounts.set(address, new Account(address));
    }
    return this.accounts.get(address)!;
  }

  getBalance(address: string): number {
    return this.getAccount(address).balance;
  }

  getTransactionHistory(address: string): Transaction[] {
    return this.getAccount(address).transactions;
  }

  addTransaction(tx: Transaction): void {
    this.getAccount(tx.from).addTransaction(tx);
    this.getAccount(tx.to).addTransaction(tx);
  }
}