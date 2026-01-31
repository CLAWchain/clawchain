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

  getArray(key: string): any[] {
    const value = this.storage.get(key);
    return Array.isArray(value) ? value : [];
  }

  setArray(key: string, value: any[]): void {
    this.storage.set(key, value);
  }

  getMapping(key: string): Map<string, any> {
    const value = this.storage.get(key);
    return value instanceof Map ? value : new Map();
  }

  setMapping(key: string, value: Map<string, any>): void {
    this.storage.set(key, value);
  }
}