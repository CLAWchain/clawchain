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
      this.updateNodeHash(node);
      this.updateParentHashes(key);
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
  }

  updateNodeHash(node: TrieNode): void {
    node.hash = hash(encodeTrieNode(node));
  }

  updateParentHashes(key: Buffer): void {
    let currentKey = key;
    let currentNode = this.getNode(currentKey);
    while (currentNode) {
      this.updateNodeHash(currentNode);
      this.markNodeDirty(currentKey, currentNode);
      currentKey = currentKey.slice(0, -1);
      currentNode = this.getNode(currentKey);
    }
  }

  commit(): void {
    this.db.batch(this.getDirtyNodes());
    this.cache.clear();
  }

  getDirtyNodes(): [Buffer, Buffer][] {
    const dirtyNodes = [];
    this.cache.forEach((key, node) => {
      dirtyNodes.push([key, encodeTrieNode(node)]);
    });
    return dirtyNodes;
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