import { ByteArray, Hash } from '../types';

export class ContractStorage {
  private storage: Map<Hash, ByteArray>;
  private arrays: Map<Hash, ByteArray[]>;

  constructor() {
    this.storage = new Map();
    this.arrays = new Map();
  }

  // CRUD operations for contract storage
  get(key: Hash): ByteArray | undefined {
    return this.storage.get(key);
  }

  set(key: Hash, value: ByteArray): void {
    this.storage.set(key, value);
  }

  delete(key: Hash): void {
    this.storage.delete(key);
  }

  // Array operations
  getArray(key: Hash): ByteArray[] {
    return this.arrays.get(key) || [];
  }

  setArray(key: Hash, values: ByteArray[]): void {
    this.arrays.set(key, values);
  }

  pushToArray(key: Hash, value: ByteArray): void {
    const arr = this.getArray(key);
    arr.push(value);
    this.setArray(key, arr);
  }

  removeFromArray(key: Hash, index: number): void {
    const arr = this.getArray(key);
    arr.splice(index, 1);
    this.setArray(key, arr);
  }
}