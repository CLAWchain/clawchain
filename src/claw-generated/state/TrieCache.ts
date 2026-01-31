import { Trie } from './Trie';

class LRUNode {
  key: string;
  value: TrieNode;
  prev: LRUNode | null;
  next: LRUNode | null;

  constructor(key: string, value: TrieNode) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class TrieCache {
  private cache: Map<string, LRUNode>;
  private head: LRUNode;
  private tail: LRUNode;
  private capacity: number;
  private trie: Trie;

  constructor(trie: Trie, capacity: number = 1000) {
    this.cache = new Map();
    this.head = new LRUNode('', null!);
    this.tail = new LRUNode('', null!);
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.capacity = capacity;
    this.trie = trie;
  }

  get(key: Buffer): TrieNode | undefined {
    const keyStr = key.toString('hex');
    if (this.cache.has(keyStr)) {
      const node = this.cache.get(keyStr)!;
      this.removeFromList(node);
      this.addToHead(node);
      return node.value;
    }

    const node = this.trie.getNode(key);
    if (node) {
      this.addToCache(keyStr, node);
    }
    return node;
  }

  set(key: Buffer, node: TrieNode): void {
    const keyStr = key.toString('hex');
    if (this.cache.has(keyStr)) {
      const existingNode = this.cache.get(keyStr)!;
      this.removeFromList(existingNode);
    }
    this.addToCache(keyStr, node);
  }

  delete(key: Buffer): void {
    const keyStr = key.toString('hex');
    if (this.cache.has(keyStr)) {
      const node = this.cache.get(keyStr)!;
      this.removeFromList(node);
      this.cache.delete(keyStr);
    }
  }

  clear(): void {
    this.cache.clear();
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  private addToCache(key: string, node: TrieNode): void {
    const lruNode = new LRUNode(key, node);
    this.addToHead(lruNode);
    this.cache.set(key, lruNode);

    if (this.cache.size > this.capacity) {
      const tail = this.tail.prev;
      if (tail !== this.head) {
        this.removeFromList(tail);
        this.cache.delete(tail.key);
      }
    }
  }

  private addToHead(node: LRUNode): void {
    const next = this.head.next;
    this.head.next = node;
    node.prev = this.head;
    node.next = next;
    next!.prev = node;
  }

  private removeFromList(node: LRUNode): void {
    const prev = node.prev;
    const next = node.next;
    prev!.next = next;
    next!.prev = prev;
  }
}

export { TrieCache };