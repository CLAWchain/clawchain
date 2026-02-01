import { Account } from './account';
import { ChainState } from './chain-state';

export class AccountAPI {
  private chainState: ChainState = new ChainState();

  getBalance(address: string): number {
    const account = this.chainState.getAccount(address);
    return account.balance;
  }

  getTransactionHistory(address: string): Transaction[] {
    const account = this.chainState.getAccount(address);
    return account.transactionHistory;
  }

  getPendingTransactions(address: string): Transaction[] {
    const account = this.chainState.getAccount(address);
    return account.pendingTransactions;
  }
}