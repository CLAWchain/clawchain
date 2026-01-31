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

  has(key: string): boolean {
    return this.storage.has(key);
  }

  getArray(key: string): any[] {
    const value = this.get(key);
    return Array.isArray(value) ? value : [];
  }

  setArray(key: string, values: any[]): void {
    this.set(key, values);
  }

  getMapping(key: string, subkey: string): any {
    const mapping = this.get(key) || {};
    return mapping[subkey];
  }

  setMapping(key: string, subkey: string, value: any): void {
    let mapping = this.get(key) || {};
    mapping[subkey] = value;
    this.set(key, mapping);
  }
}