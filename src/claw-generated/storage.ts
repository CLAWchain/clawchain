import { MerklePatriciaTrie } from './trie';

export class ContractStorage {
  private trie: MerklePatriciaTrie;

  constructor() {
    this.trie = new MerklePatriciaTrie();
  }

  async read(key: string): Promise<any> {
    return await this.trie.get(key);
  }

  async write(key: string, value: any): Promise<void> {
    await this.trie.put(key, value);
  }

  async delete(key: string): Promise<void> {
    await this.trie.delete(key);
  }

  async readMap(mapKey: string, key: string): Promise<any> {
    const map = await this.read(mapKey);
    if (!map) {
      return null;
    }
    return map[key];
  }

  async writeMap(mapKey: string, key: string, value: any): Promise<void> {
    let map = await this.read(mapKey);
    if (!map) {
      map = {};
    }
    map[key] = value;
    await this.write(mapKey, map);
  }

  async deleteMapKey(mapKey: string, key: string): Promise<void> {
    let map = await this.read(mapKey);
    if (!map) {
      return;
    }
    delete map[key];
    await this.write(mapKey, map);
  }

  async readArray(arrayKey: string, index: number): Promise<any> {
    const array = await this.read(arrayKey);
    if (!array || index >= array.length) {
      return null;
    }
    return array[index];
  }

  async writeArray(arrayKey: string, index: number, value: any): Promise<void> {
    let array = await this.read(arrayKey);
    if (!array) {
      array = [];
    }
    array[index] = value;
    await this.write(arrayKey, array);
  }

  async pushArray(arrayKey: string, value: any): Promise<number> {
    let array = await this.read(arrayKey);
    if (!array) {
      array = [];
    }
    array.push(value);
    await this.write(arrayKey, array);
    return array.length;
  }

  async deleteArrayElement(arrayKey: string, index: number): Promise<void> {
    let array = await this.read(arrayKey);
    if (!array || index >= array.length) {
      return;
    }
    array.splice(index, 1);
    await this.write(arrayKey, array);
  }
}