import { PrivateKey, PublicKey } from '../crypto';

export class AccountStorage {
  private storage: Map<string, Map<string, any>>;

  constructor() {
    this.storage = new Map();
  }

  getAccount(publicKey: PublicKey): Map<string, any> {
    const accountKey = publicKey.toString();
    if (!this.storage.has(accountKey)) {
      this.storage.set(accountKey, new Map());
    }
    return this.storage.get(accountKey)!;
  }

  setAccountState(publicKey: PublicKey, key: string, value: any): void {
    const account = this.getAccount(publicKey);
    account.set(key, value);
  }

  getAccountState(publicKey: PublicKey, key: string): any {
    const account = this.getAccount(publicKey);
    return account.get(key);
  }
}