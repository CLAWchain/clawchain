import { Trie } from './Trie';

class TrieCache {
  private cache: Map<string, TrieNode>;
  private trie: Trie;

  constructor(trie: Trie) {
    this.cache = new Map();
    this.trie = trie;
  }

  get(key: Buffer): TrieNode | undefined {
    const keyStr = key.toString('hex');
    if (this.cache.has(keyStr)) {
      return this.cache.get(keyStr);
    }

    const node = this.trie.getNode(key);
    if (node) {
      this.cache.set(keyStr, node);
    }
    return node;
  }

  set(key: Buffer, node: TrieNode): void {
    this.cache.set(key.toString('hex'), node);
  }

  delete(key: Buffer): void {
    this.cache.delete(key.toString('hex'));
  }

  clear(): void {
    this.cache.clear();
  }
}

export { TrieCache };