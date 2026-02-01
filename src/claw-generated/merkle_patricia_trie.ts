// Merkle Patricia Trie implementation for ClawChain state
import { hash, HexString } from '../state/crypto';
import LRUCache from 'lru-cache';

type TrieNode = {
  key: HexString;
  value: HexString | null;
  children: { [key: string]: TrieNode };
};

class MerklePatriciaTrie {
  private root: TrieNode = {
    key: '',
    value: null,
    children: {},
  };

  private cache: LRUCache<HexString, TrieNode>;

  constructor() {
    this.cache = new LRUCache<HexString, TrieNode>({
      max: 1000, // Maximum number of nodes to cache
      maxAge: 60 * 1000, // Cache entries expire after 1 minute
    });
  }

  /**
   * Get the value associated with a given key.
   * @param key - The key to look up.
   * @returns The value associated with the key, or null if not found.
   */
  get(key: HexString): HexString | null {
    // Check the cache first
    const cachedNode = this.cache.get(key);
    if (cachedNode) {
      return cachedNode.value;
    }

    // If not in cache, load the node from the database
    let node: TrieNode = this.root;
    for (let i = 0; i < key.length; i += 2) {
      const nibble = key.slice(i, i + 2);
      if (!node.children[nibble]) {
        return null;
      }
      node = node.children[nibble];
    }

    // Cache the loaded node
    this.cache.set(key, node);
    return node.value;
  }

  /**
   * Insert a new key-value pair into the trie.
   * @param key - The key to insert.
   * @param value - The value to associate with the key.
   */
  set(key: HexString, value: HexString): void {
    let node: TrieNode = this.root;
    for (let i = 0; i < key.length; i += 2) {
      const nibble = key.slice(i, i + 2);
      if (!node.children[nibble]) {
        node.children[nibble] = {
          key: nibble,
          value: null,
          children: {},
        };
      }
      node = node.children[nibble];
    }
    node.value = value;

    // Update the cache
    this.cache.set(key, node);
  }

  /**
   * Delete a key-value pair from the trie.
   * @param key - The key to delete.
   */
  delete(key: HexString): void {
    this.deleteRecursive(this.root, key, 0);
    this.cache.del(key);
  }

  private deleteRecursive(node: TrieNode, key: HexString, index: number): TrieNode | null {
    if (index === key.length) {
      if (!node.value) {
        return null;
      }
      node.value = null;
      return Object.keys(node.children).length === 0 ? null : node;
    }

    const nibble = key.slice(index, index + 2);
    const child = node.children[nibble];
    if (!child) {
      return node;
    }

    const newChild = this.deleteRecursive(child, key, index + 2);
    if (newChild) {
      node.children[nibble] = newChild;
    } else {
      delete node.children[nibble];
    }

    if (Object.keys(node.children).length === 0 && !node.value) {
      return null;
    }

    return node;
  }

  /**
   * Generate a Merkle proof for a given key.
   * @param key - The key to generate a proof for.
   * @returns The Merkle proof as a list of nodes.
   */
  getProof(key: HexString): TrieNode[] {
    const proof: TrieNode[] = [];
    this.getProofRecursive(this.root, key, 0, proof);
    return proof;
  }

  private getProofRecursive(
    node: TrieNode,
    key: HexString,
    index: number,
    proof: TrieNode[]
  ): boolean {
    proof.push(node);

    if (index === key.length) {
      return node.value !== null;
    }

    const nibble = key.slice(index, index + 2);
    const child = node.children[nibble];
    if (!child) {
      return false;
    }

    return this.getProofRecursive(child, key, index + 2, proof);
  }

  /**
   * Get the root hash of the trie.
   * @returns The root hash as a hex string.
   */
  getRootHash(): HexString {
    return hash(JSON.stringify(this.root));
  }
}

export default MerklePatriciaTrie;