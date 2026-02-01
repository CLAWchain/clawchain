import { StorageItem, StorageType } from './types';

export class ContractStorage {
  private storage: Map<string, StorageItem> = new Map();

  get(key: string): StorageItem | undefined {
    return this.storage.get(key);
  }

  set(key: string, value: StorageItem): void {
    this.storage.set(key, value);
  }

  delete(key: string): void {
    this.storage.delete(key);
  }

  getMapValue(key: string, mapKey: string): any | undefined {
    const item = this.get(key);
    if (item?.type === StorageType.Map) {
      return item.value.get(mapKey);
    }
    return undefined;
  }

  setMapValue(key: string, mapKey: string, value: any): void {
    let item = this.get(key);
    if (!item) {
      item = { type: StorageType.Map, value: new Map() };
      this.set(key, item);
    }
    if (item.type === StorageType.Map) {
      item.value.set(mapKey, value);
    }
  }

  deleteMapValue(key: string, mapKey: string): void {
    const item = this.get(key);
    if (item?.type === StorageType.Map) {
      item.value.delete(mapKey);
    }
  }

  getArrayValue(key: string, index: number): any | undefined {
    const item = this.get(key);
    if (item?.type === StorageType.Array) {
      return item.value[index];
    }
    return undefined;
  }

  pushArrayValue(key: string, value: any): void {
    let item = this.get(key);
    if (!item) {
      item = { type: StorageType.Array, value: [] };
      this.set(key, item);
    }
    if (item.type === StorageType.Array) {
      item.value.push(value);
    }
  }

  setArrayValue(key: string, index: number, value: any): void {
    const item = this.get(key);
    if (item?.type === StorageType.Array) {
      item.value[index] = value;
    }
  }

  deleteArrayValue(key: string, index: number): void {
    const item = this.get(key);
    if (item?.type === StorageType.Array) {
      item.value.splice(index, 1);
    }
  }
}