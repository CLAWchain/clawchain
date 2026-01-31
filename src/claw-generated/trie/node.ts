export class TrieNode {
  type: 'branch' | 'extension' | 'leaf';
  key: Uint8Array;
  value: Uint8Array | null;
  children: Map<number, TrieNode> | null;

  constructor(type: 'branch' | 'extension' | 'leaf', key: Uint8Array, value: Uint8Array | null, children: Map<number, TrieNode> | null) {
    this.type = type;
    this.key = key;
    this.value = value;
    this.children = children;
  }
}