import { ByteArray, U256 } from '../types';

export class ContractStorage {
  private storage: Map<string, any> = new Map();

  get(key: string): any {
    return this.storage.get(key);
  }

  set(key: string, value: any): void {
    this.storage.set(key, value);
  }

  delete(key: string): void {
    this.storage.delete(key);
  }

  getMapping<K, V>(key: string): Map<K, V> {
    const value = this.storage.get(key);
    if (value instanceof Map) {
      return value;
    } else {
      const newMap = new Map<K, V>();
      this.storage.set(key, newMap);
      return newMap;
    }
  }

  getArray<T>(key: string): T[] {
    const value = this.storage.get(key);
    if (value instanceof Array) {
      return value;
    } else {
      const newArray: T[] = [];
      this.storage.set(key, newArray);
      return newArray;
    }
  }

  getInt(key: string): number {
    return this.get(key) as number;
  }

  setInt(key: string, value: number): void {
    this.set(key, value);
  }

  getBool(key: string): boolean {
    return this.get(key) as boolean;
  }

  setBool(key: string, value: boolean): void {
    this.set(key, value);
  }

  getString(key: string): string {
    return this.get(key) as string;
  }

  setString(key: string, value: string): void {
    this.set(key, value);
  }
}