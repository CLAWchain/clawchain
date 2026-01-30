import { ContractStorage } from './storage';
import { Hash, U256 } from '../types';

export class ContractMapping<K extends Hash, V extends ByteArray> {
  private storage: ContractStorage;

  constructor(storage: ContractStorage) {
    this.storage = storage;
  }

  get(key: K): V | undefined {
    const item = this.storage.get(key);
    return item?.value as V | undefined;
  }

  set(key: K, value: V): void {
    this.storage.set(key, value);
  }

  delete(key: K): void {
    this.storage.delete(key);
  }
}