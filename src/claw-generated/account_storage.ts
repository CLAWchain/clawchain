import { Account } from '../types';

export class AccountStorage {
  private storage: Map<string, Map<string, any>>;

  constructor() {
    this.storage = new Map();
  }

  getAccount(address: string): Account {
    if (!this.storage.has(address)) {
      this.storage.set(address, new Map());
    }
    return {
      address,
      state: this.storage.get(address)!,
    };
  }

  setAccountState(address: string, key: string, value: any): void {
    const account = this.getAccount(address);
    account.state.set(key, value);
  }

  getAccountState(address: string, key: string): any {
    const account = this.getAccount(address);
    return account.state.get(key);
  }
}