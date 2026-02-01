// src/claw-generated/state/merkle-patricia-trie.ts
import { keccak256 } from 'js-sha3';

class MerklePatriciaTrie {
  private root: Node;

  constructor() {
    this.root = new EmptyNode();
  }

  // Implement Merkle Patricia Trie operations here
}

abstract class Node {
  abstract get hash(): string;
  abstract get type(): string;
}

class EmptyNode extends Node {
  get hash(): string {
    return keccak256('');
  }

  get type(): string {
    return 'empty';
  }
}

// Implement other node types (BranchNode, ExtensionNode, LeafNode) here