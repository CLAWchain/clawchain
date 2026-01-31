import { TrieNode, TrieNodeType } from './node';
import { keccak256 } from 'js-sha3';

export class MerklePatriciaTrieHash {
  static hash(node: TrieNode): Uint8Array {
    // Implement hashing logic
    // - Hash node type, path, and value
    // - Handle branch nodes recursively
    return new Uint8Array();
  }

  static getRootHash(root: TrieNode | null): Uint8Array {
    // Calculate the root hash of the trie
    // - Return empty hash if trie is empty
    // - Otherwise, return the hash of the root node
    return new Uint8Array();
  }
}