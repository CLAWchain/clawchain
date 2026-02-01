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

  // ... (other methods remain the same)
}

export default MerklePatriciaTrie;