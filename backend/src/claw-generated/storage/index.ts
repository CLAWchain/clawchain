import { MerklePatriciaTrie } from '../trie';

export class ContractStorage {
  private trie: MerklePatriciaTrie;

  constructor() {
    this.trie = new MerklePatriciaTrie();
  }

  // Mapping storage
  set(key: string, value: any): void {
    this.trie.put(key, JSON.stringify(value));
  }

  get(key: string): any {
    const valueStr = this.trie.get(key);
    return valueStr ? JSON.parse(valueStr) : undefined;
  }

  has(key: string): boolean {
    return this.trie.has(key);
  }

  delete(key: string): void {
    this.trie.delete(key);
  }

  // Array storage
  push(value: any): number {
    const length = this.length();
    this.set(length.toString(), value);
    return length;
  }

  get(index: number): any {
    return this.get(index.toString());
  }

  set(index: number, value: any): void {
    this.set(index.toString(), value);
  }

  length(): number {
    let length = 0;
    while (this.has(length.toString())) {
      length++;
    }
    return length;
  }

  delete(index: number): void {
    this.trie.delete(index.toString());
  }
}