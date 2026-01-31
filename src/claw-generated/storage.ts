export class ContractStorage {
  private store: Map<string, any> = new Map();

  get(key: string): any {
    return this.store.get(key);
  }

  set(key: string, value: any): void {
    this.store.set(key, value);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  getMapping(key: string): Map<string, any> {
    let mapping = this.get(key);
    if (!mapping) {
      mapping = new Map();
      this.set(key, mapping);
    }
    return mapping as Map<string, any>;
  }

  getArray(key: string): any[] {
    let array = this.get(key);
    if (!array) {
      array = [];
      this.set(key, array);
    }
    return array as any[];
  }
}