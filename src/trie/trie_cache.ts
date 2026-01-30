import { TrieNode } from './patricia_trie';

class TrieCache {
  private cache: Map<string, TrieNode>;
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: string): TrieNode | undefined {
    return this.cache.get(key);
  }

  set(key: string, node: TrieNode): void {
    this.cache.set(key, node);
    if (this.cache.size > this.maxSize) {
      this.evictOldest();
    }
  }

  private evictOldest(): void {
    const oldestKey = this.getOldestKey();
    this.cache.delete(oldestKey);
  }

  private getOldestKey(): string {
    return this.cache.keys().next().value;
  }
}

export { TrieCache };