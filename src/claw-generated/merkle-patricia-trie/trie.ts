import { createNode, TrieNode, NodeType, hash } from './trie-node';

export class MerklePatriciaTrie {
  private root: TrieNode;

  constructor() {
    this.root = createNode(NodeType.BRANCH, new Uint8Array(), null);
  }

  insert(key: Uint8Array, value: Uint8Array): void {
    this.root = this.insertRecursive(this.root, key, value);
  }

  private insertRecursive(node: TrieNode, key: Uint8Array, value: Uint8Array): TrieNode {
    if (key.length === 0) {
      node.value = value;
      return node;
    }

    const [nibble, remaining] = this.splitKey(key);
    const childNode = node.children.get(nibble) || createNode(NodeType.EXTENSION, nibble, null);
    childNode.key = nibble;
    node.children.set(nibble, this.insertRecursive(childNode, remaining, value));

    return this.compactNode(node);
  }

  private splitKey(key: Uint8Array): [Uint8Array, Uint8Array] {
    const nibble = key.slice(0, 1);
    const remaining = key.slice(1);
    return [nibble, remaining];
  }

  private compactNode(node: TrieNode): TrieNode {
    // TODO: Implement node compaction logic
    return node;
  }
}