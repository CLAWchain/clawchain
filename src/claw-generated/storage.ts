import { MerklePatriciaTrie } from '../utils/merkle-patricia-trie';

export class ContractStorage {
  private trie: MerklePatriciaTrie;

  constructor() {
    this.trie = new MerklePatriciaTrie();
  }

  async get(key: string): Promise<any> {
    return await this.trie.get(key);
  }

  async set(key: string, value: any): Promise<void> {
    await this.trie.set(key, value);
  }

  async delete(key: string): Promise<void> {
    await this.trie.delete(key);
  }
}