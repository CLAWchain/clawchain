import { MerklePatriciaTrie } from './MerklePatriciaTrie';

interface StorageItem {
  value: any;
  type: 'value' | 'mapping' | 'array';
}

class ContractStorage {
  private trie: MerklePatriciaTrie;

  constructor() {
    this.trie = new MerklePatriciaTrie();
  }

  async get(key: string): Promise<StorageItem | undefined> {
    const value = await this.trie.get(key);
    if (value === null) {
      return undefined;
    }
    return JSON.parse(value) as StorageItem;
  }

  async set(key: string, item: StorageItem): Promise<void> {
    await this.trie.put(key, JSON.stringify(item));
  }

  async delete(key: string): Promise<void> {
    await this.trie.delete(key);
  }
}

export { ContractStorage, StorageItem };