import { H256 } from '../types';

export class AccountStorage {
  private storage: Map<H256, Map<H256, Uint8Array>> = new Map();

  getStorageSlot(address: H256, slot: H256): Uint8Array | undefined {
    const accountStorage = this.storage.get(address);
    if (accountStorage) {
      return accountStorage.get(slot);
    }
    return undefined;
  }

  setStorageSlot(address: H256, slot: H256, value: Uint8Array): void {
    let accountStorage = this.storage.get(address);
    if (!accountStorage) {
      accountStorage = new Map();
      this.storage.set(address, accountStorage);
    }
    accountStorage.set(slot, value);
  }

  clearStorageSlot(address: H256, slot: H256): void {
    const accountStorage = this.storage.get(address);
    if (accountStorage) {
      accountStorage.delete(slot);
    }
  }
}