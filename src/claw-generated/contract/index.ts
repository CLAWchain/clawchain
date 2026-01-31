export class ContractStorage {
  private storage: Map<string, any> = new Map();

  set(key: string, value: any): void {
    this.storage.set(key, value);
  }

  get(key: string): any {
    return this.storage.get(key);
  }

  delete(key: string): void {
    this.storage.delete(key);
  }

  has(key: string): boolean {
    return this.storage.has(key);
  }

  setArray(key: string, values: any[]): void {
    this.storage.set(key, values);
  }

  getArray(key: string): any[] {
    return this.storage.get(key) || [];
  }

  pushToArray(key: string, value: any): void {
    const arr = this.getArray(key);
    arr.push(value);
    this.setArray(key, arr);
  }

  removeFromArray(key: string, value: any): void {
    const arr = this.getArray(key);
    const index = arr.indexOf(value);
    if (index !== -1) {
      arr.splice(index, 1);
      this.setArray(key, arr);
    }
  }
}