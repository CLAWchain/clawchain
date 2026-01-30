import { ContractStorage } from './storage';
import { Hash, U256 } from '../types';

export class ContractArray<T extends ByteArray> {
  private storage: ContractStorage;
  private lengthKey: Hash;

  constructor(storage: ContractStorage, lengthKey: Hash) {
    this.storage = storage;
    this.lengthKey = lengthKey;
  }

  get length(): U256 {
    const lengthItem = this.storage.get(this.lengthKey);
    return lengthItem?.value as U256 || U256.zero();
  }

  get(index: U256): T | undefined {
    const key = this.getItemKey(index);
    const item = this.storage.get(key);
    return item?.value as T | undefined;
  }

  push(value: T): void {
    const length = this.length;
    const key = this.getItemKey(length);
    this.storage.set(key, value);
    this.storage.set(this.lengthKey, length.increment());
  }

  delete(index: U256): void {
    const key = this.getItemKey(index);
    this.storage.delete(key);
    this.storage.set(this.lengthKey, this.length.decrement());
  }

  private getItemKey(index: U256): Hash {
    return Hash.fromU256(index);
  }
}