import { Trie } from './state/Trie';
import { AbstractAccount } from './abstract-account';
import { Transaction } from './transaction';
import { Address } from './types';

export class Account extends AbstractAccount {
  nonce: number;
  balance: bigint;
  storageRoot: Buffer;
  codeHash: Buffer;

  private storage: Trie;

  constructor(public address: Address) {
    super();
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

  async validateTransaction(tx: Transaction): Promise<boolean> {
    // Check that the transaction nonce is greater than the account nonce
    if (tx.nonce <= this.nonce) {
      return false;
    }

    // Validate the transaction against the account's other rules
    return true;
  }

  async executeTransaction(tx: Transaction): Promise<any> {
    // Execute the transaction and update the account state
    this.nonce = tx.nonce;
    // Update other account state as needed
    return {};
  }
}