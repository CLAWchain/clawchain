import { ContractStorage } from './storage';
import { ContractMapping } from './mapping';
import { ContractArray } from './array';
import { ByteArray, Hash, U256 } from '../types';

export class Contract {
  private storage: ContractStorage;

  constructor() {
    this.storage = new ContractStorage();
  }

  getStorage(): ContractStorage {
    return this.storage;
  }

  getMapping<K extends Hash, V extends ByteArray>(key: Hash): ContractMapping<K, V> {
    return new ContractMapping<K, V>(this.storage);
  }

  getArray<T extends ByteArray>(lengthKey: Hash): ContractArray<T> {
    return new ContractArray<T>(this.storage, lengthKey);
  }
}