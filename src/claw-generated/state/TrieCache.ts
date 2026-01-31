import MerklePatriciaTrie from './MerklePatriciaTrie';

class TrieCache {
  private cache: Map<string, TrieNode>;
  private trie: MerklePatriciaTrie;

  constructor(trie: MerklePatriciaTrie) {
    this.cache = new Map();
    this.trie = trie;
  }

  get(key: string): any {
    const node = this.getNode(key);
    return node ? node.value : null;
  }

  set(key: string, value: any): void {
    const node = this.getOrCreateNode(key);
    node.value = value;
    this.trie.setRecursive(this.trie.root, key, value, 0);
  }

  private getNode(key: string): TrieNode | null {
    const hash = this.trie.getNodeHash(key);
    return this.cache.get(hash) || null;
  }

  private getOrCreateNode(key: string): TrieNode {
    const hash = this.trie.getNodeHash(key);
    let node = this.cache.get(hash);
    if (!node) {
      node = this.trie.getNode(key);
      this.cache.set(hash, node);
    }
    return node;
  }
}

export default TrieCache;