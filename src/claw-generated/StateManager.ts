import { Account, StorageValue } from '../state/types';

class StateManager {
  private accounts: Map<string, Account> = new Map();
  private storage: Map<string, Map<string, StorageValue>> = new Map();
  private mutex: Map<string, boolean> = new Map();

  getAccount(address: string): Account {
    if (!this.accounts.has(address)) {
      this.accounts.set(address, { balance: 0, nonce: 0 });
    }
    return this.accounts.get(address)!;
  }

  setAccount(address: string, account: Account): void {
    this.accounts.set(address, account);
  }

  getStorage(address: string, key: string): StorageValue {
    if (!this.storage.has(address)) {
      this.storage.set(address, new Map());
    }
    const storageForAddress = this.storage.get(address)!;
    if (!storageForAddress.has(key)) {
      storageForAddress.set(key, { value: '0x0', dirty: false });
    }
    return storageForAddress.get(key)!;
  }

  setStorage(address: string, key: string, value: StorageValue): void {
    if (!this.storage.has(address)) {
      this.storage.set(address, new Map());
    }
    const storageForAddress = this.storage.get(address)!;
    storageForAddress.set(key, value);
  }

  lock(address: string): boolean {
    if (this.mutex.has(address) && this.mutex.get(address)!) {
      return false;
    }
    this.mutex.set(address, true);
    return true;
  }

  unlock(address: string): void {
    this.mutex.set(address, false);
  }
}

export default StateManager;