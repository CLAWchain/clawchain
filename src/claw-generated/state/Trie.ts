import { TrieCache } from './TrieCache';
import { TrieNode, encodeTrieNode, decodeTrieNode } from './TrieNode';
import { hash } from '../crypto';

class Trie {
  private cache: TrieCache;
  private root: Buffer;
  private db: KeyValueStore;

  constructor(db: KeyValueStore) {
    this.cache = new TrieCache(this);
    this.db = db;
    this.root = Buffer.alloc(32, 0);
  }

  getNode(key: Buffer): TrieNode | undefined {
    const cachedNode = this.cache.get(key);
    if (cachedNode) {
      return cachedNode;
    }

    const nodeData = this.db.get(key);
    if (nodeData) {
      const node = decodeTrieNode(nodeData);
      this.cache.set(key, node);
      return node;
    }

    return undefined;
  }

  set(key: Buffer, value: any): void {
    let node = this.getOrCreateNode(key);
    if (node.value !== value) {
      node.value = value;
      this.markNodeDirty(key, node);
    }
  }

  getOrCreateNode(key: Buffer): TrieNode {
    let node = this.getNode(key);
    if (!node) {
      node = createEmptyNode();
      this.cache.set(key, node);
    }
    return node;
  }

  markNodeDirty(key: Buffer, node: TrieNode): void {
    this.cache.set(key, node);
    // TODO: Implement updating node hashes and marking parent nodes as dirty
  }

  commit(): void {
    // Implement batch database writes
    this.db.batch(this.getDirtyNodes());
    this.cache.clear();
  }

  getDirtyNodes(): [Buffer, Buffer][] {
    // TODO: Implement getting all dirty nodes from the cache
    return [];
  }
}

function createEmptyNode(): TrieNode {
  return {
    value: null,
    children: {},
    isLeaf: true,
    hash: Buffer.alloc(32, 0),
  };
}

export { Trie };