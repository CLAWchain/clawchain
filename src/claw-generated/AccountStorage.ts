import { MerklePatriciaTrie } from './MerklePatriciaTrie';

class AccountStorage {
  private trie: MerklePatriciaTrie;

  constructor() {
    this.trie = new MerklePatriciaTrie();
  }

  async get(address: string, key: string): Promise<Uint8Array | null> {
    const accountKey = this.getAccountKey(address);
    const value = this.trie.get(accountKey);
    if (!value) {
      return null;
    }

    const accountStorage = JSON.parse(Buffer.from(value).toString());
    return accountStorage[key] ? new Uint8Array(accountStorage[key]) : null;
  }

  async set(address: string, key: string, value: Uint8Array): Promise<void> {
    const accountKey = this.getAccountKey(address);
    const accountStorage = await this.getAccountStorage(address);
    accountStorage[key] = Array.from(value);
    this.trie.set(accountKey, new Uint8Array(Buffer.from(JSON.stringify(accountStorage))));
  }

  private getAccountKey(address: string): Uint8Array {
    return new Uint8Array(Buffer.from(address, 'hex'));
  }

  private async getAccountStorage(address: string): Promise<Record<string, any>> {
    const accountKey = this.getAccountKey(address);
    const value = this.trie.get(accountKey);
    return value ? JSON.parse(Buffer.from(value).toString()) : {};
  }
}

export { AccountStorage };