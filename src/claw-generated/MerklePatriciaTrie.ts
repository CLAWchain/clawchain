import { hash } from '../blockchain/Crypto';

class MerklePatriciaTrie {
  private root: TrieNode | null = null;

  // Implement Merkle Patricia Trie methods here
}

class TrieNode {
  key: string;
  value: any;
  children: Map<string, TrieNode>;
  hash: string;

  constructor(key: string, value: any) {
    this.key = key;
    this.value = value;
    this.children = new Map();
    this.hash = hash(key + JSON.stringify(value));
  }
}