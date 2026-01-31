import { Trie } from './trie';

export class Account {
  nonce: number;
  balance: bigint;
  storageRoot: Buffer;
  codeHash: Buffer;

  private storage: Trie;

  constructor() {
    this.nonce = 0;
    this.balance = BigInt(0);
    this.storageRoot = Buffer.alloc(32, 0);
    this.codeHash = Buffer.alloc(32, 0);
    this.storage = new Trie();
  }

  getStorageValue(key: Buffer): Buffer | null {
    return this.storage.get(key);
  }

  setStorageValue(key: Buffer, value: Buffer): void {
    this.storage.set(key, value);
    this.storageRoot = this.storage.root;
  }

  clearStorage(): void {
    this.storage.clear();
    this.storageRoot = Buffer.alloc(32, 0);
  }
}