import { ByteArray, Hash, U256 } from '../types';

interface StorageItem {
  value: ByteArray;
  version: U256;
}

export class ContractStorage {
  private storage: Map<Hash, StorageItem> = new Map();

  get(key: Hash): StorageItem | undefined {
    return this.storage.get(key);
  }

  set(key: Hash, value: ByteArray): void {
    const currentVersion = this.storage.get(key)?.version || U256.zero();
    this.storage.set(key, { value, version: currentVersion.increment() });
  }

  delete(key: Hash): void {
    this.storage.delete(key);
  }
}