import { hash, Node, RootNode, ValueNode } from './trie-node';

class MerklePatriciaTrie {
  private rootNode: RootNode;

  constructor() {
    this.rootNode = new RootNode();
  }

  // Implement Merkle Patricia Trie operations here
  // - get, set, delete, generate proof, verify proof, etc.
}

export default MerklePatriciaTrie;