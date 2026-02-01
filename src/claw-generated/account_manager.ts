import { AccountStorage } from './account_storage';
import { Account } from './types';

export class AccountManager {
  private accountStorage: AccountStorage;

  constructor() {
    this.accountStorage = new AccountStorage();
  }

  getAccount(address: string): Account {
    return this.accountStorage.getAccount(address);
  }

  setAccountState(address: string, key: string, value: any): void {
    this.accountStorage.setAccountState(address, key, value);
  }

  getAccountState(address: string, key: string): any {
    return this.accountStorage.getAccountState(address, key);
  }
}