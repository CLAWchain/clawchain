// Merkle Patricia Trie node
export type TrieNodeType = 'extension' | 'leaf' | 'branch';

export interface TrieNode {
  type: TrieNodeType;
  path: Uint8Array; // Encoded node path
  value: Uint8Array | null; // Associated value (null for branch nodes)
  children: { [key: string]: TrieNode }; // Child nodes (for branch nodes)
}