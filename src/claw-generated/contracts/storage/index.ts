import { MPTrie } from '../trie';

class ContractStorage {
  private trie: MPTrie;

  constructor() {
    this.trie = new MPTrie();
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

  async getMapping(baseKey: string, index: string): Promise<any> {
    const key = `${baseKey}:${index}`;
    return await this.get(key);
  }

  async setMapping(baseKey: string, index: string, value: any): Promise<void> {
    const key = `${baseKey}:${index}`;
    await this.set(key, value);
  }

  async deleteMapping(baseKey: string, index: string): Promise<void> {
    const key = `${baseKey}:${index}`;
    await this.delete(key);
  }

  async getArray(baseKey: string): Promise<any[]> {
    let i = 0;
    const result: any[] = [];
    while (true) {
      const value = await this.getMapping(baseKey, i.toString());
      if (value === undefined) {
        break;
      }
      result.push(value);
      i++;
    }
    return result;
  }

  async setArray(baseKey: string, values: any[]): Promise<void> {
    for (let i = 0; i < values.length; i++) {
      await this.setMapping(baseKey, i.toString(), values[i]);
    }
  }

  async deleteArray(baseKey: string): Promise<void> {
    let i = 0;
    while (true) {
      const value = await this.getMapping(baseKey, i.toString());
      if (value === undefined) {
        break;
      }
      await this.deleteMapping(baseKey, i.toString());
      i++;
    }
  }
}

export default ContractStorage;