import { keccak256 } from 'js-sha3';

class MerklePatriciaTrie {
  private root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  set(key: string, value: any): void {
    this.setRecursive(this.root, key, value, 0);
  }

  private setRecursive(node: TrieNode, key: string, value: any, index: number): TrieNode {
    if (index === key.length) {
      node.value = value;
      return node;
    }

    const currentChar = key[index];
    let childNode = node.getChild(currentChar);
    if (!childNode) {
      childNode = new TrieNode();
      node.addChild(currentChar, childNode);
    }

    childNode = this.setRecursive(childNode, key, value, index + 1);
    node.updateChild(currentChar, childNode);
    return node;
  }

  get(key: string): any {
    return this.getRecursive(this.root, key, 0);
  }

  private getRecursive(node: TrieNode, key: string, index: number): any {
    if (index === key.length) {
      return node.value;
    }

    const currentChar = key[index];
    const childNode = node.getChild(currentChar);
    if (!childNode) {
      return null;
    }

    return this.getRecursive(childNode, key, index + 1);
  }

  getRootHash(): string {
    return this.root.hash();
  }

  // New methods for state proofs and snapshots
  generateProof(key: string): Proof {
    const proof: Proof = [];
    this.generateProofRecursive(this.root, key, 0, proof);
    return proof;
  }

  private generateProofRecursive(node: TrieNode, key: string, index: number, proof: Proof): boolean {
    if (index === key.length) {
      proof.push(node);
      return true;
    }

    const currentChar = key[index];
    const childNode = node.getChild(currentChar);
    if (!childNode) {
      return false;
    }

    proof.push(node);
    return this.generateProofRecursive(childNode, key, index + 1, proof);
  }

  verifyProof(key: string, proof: Proof, rootHash: string): boolean {
    let currentNode = new TrieNode();
    for (const node of proof) {
      currentNode = this.verifyProofRecursive(currentNode, node, key, 0);
      if (!currentNode) {
        return false;
      }
    }
    return currentNode.hash() === rootHash;
  }

  private verifyProofRecursive(currentNode: TrieNode, proofNode: TrieNode, key: string, index: number): TrieNode | null {
    if (index === key.length) {
      return proofNode;
    }

    const currentChar = key[index];
    const childNode = proofNode.getChild(currentChar);
    if (!childNode) {
      return null;
    }

    return this.verifyProofRecursive(childNode, childNode, key, index + 1);
  }

  // Snapshot management
  createSnapshot(): TrieSnapshot {
    return new TrieSnapshot(this.root);
  }

  restoreSnapshot(snapshot: TrieSnapshot): void {
    this.root = snapshot.restore();
  }
}

class TrieNode {
  private children: Map<string, TrieNode>;
  value: any;

  constructor() {
    this.children = new Map();
    this.value = null;
  }

  addChild(char: string, node: TrieNode): void {
    this.children.set(char, node);
  }

  updateChild(char: string, node: TrieNode): void {
    this.children.set(char, node);
  }

  getChild(char: string): TrieNode | null {
    return this.children.get(char) || null;
  }

  hash(): string {
    const childHashes = Array.from(this.children.values())
      .map((child) => child.hash())
      .sort()
      .join('');
    const nodeData = `${childHashes}${this.value || ''}`;
    return keccak256(nodeData);
  }
}

class TrieSnapshot {
  private snapshotRoot: TrieNode;

  constructor(root: TrieNode) {
    this.snapshotRoot = this.cloneNode(root);
  }

  private cloneNode(node: TrieNode): TrieNode {
    const clonedNode = new TrieNode();
    clonedNode.value = node.value;

    for (const [char, child] of node.children) {
      clonedNode.addChild(char, this.cloneNode(child));
    }

    return clonedNode;
  }

  restore(): TrieNode {
    return this.snapshotRoot;
  }
}

type Proof = TrieNode[];

export default MerklePatriciaTrie;