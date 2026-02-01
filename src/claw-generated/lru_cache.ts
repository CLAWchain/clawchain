import { TrieNode } from '../state/types';

class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;
  private order: K[];

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
    this.order = [];
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }

    this.order = this.order.filter(k => k !== key);
    this.order.push(key);
    return this.cache.get(key);
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.order = this.order.filter(k => k !== key);
    }

    this.order.push(key);
    this.cache.set(key, value);

    if (this.order.length > this.capacity) {
      const evictedKey = this.order.shift();
      this.cache.delete(evictedKey!);
    }
  }
}

export class TrieNodeCache extends LRUCache<string, TrieNode> {
  constructor(capacity: number) {
    super(capacity);
  }
}