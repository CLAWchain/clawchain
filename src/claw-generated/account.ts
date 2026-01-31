export class Account {
  public address: string;
  public balance: number;
  public nonce: number;
  public storage: Map<string, string>;

  constructor(address: string, balance: number, nonce: number) {
    this.address = address;
    this.balance = balance;
    this.nonce = nonce;
    this.storage = new Map();
  }

  getStorageValue(key: string): string | undefined {
    return this.storage.get(key);
  }

  setStorageValue(key: string, value: string): void {
    this.storage.set(key, value);
  }

  deleteStorageValue(key: string): void {
    this.storage.delete(key);
  }
}