import { keccak256 } from 'js-sha3';

interface TrieNode {
  key: string;
  value: string | null;
  children: { [key: string]: TrieNode };
}

class MerklePatriciaTrie {
  private root: TrieNode;

  constructor() {
    this.root = {
      key: '',
      value: null,
      children: {},
    };
  }

  get(key: string): string | null {
    let node: TrieNode = this.root;
    for (let i = 0; i < key.length; i++) {
      const char = key[i];
      if (node.children[char]) {
        node = node.children[char];
      } else {
        return null;
      }
    }
    return node.value;
  }

  set(key: string, value: string): void {
    this.root = this.setRecursive(this.root, key, 0, value);
  }

  private setRecursive(node: TrieNode, key: string, index: number, value: string): TrieNode {
    if (index === key.length) {
      node.value = value;
      return node;
    }

    const char = key[index];
    if (!node.children[char]) {
      node.children[char] = {
        key: '',
        value: null,
        children: {},
      };
    }
    node.children[char] = this.setRecursive(node.children[char], key, index + 1, value);
    return node;
  }

  delete(key: string): void {
    this.root = this.deleteRecursive(this.root, key, 0);
  }

  private deleteRecursive(node: TrieNode, key: string, index: number): TrieNode {
    if (index === key.length) {
      if (node.value !== null) {
        node.value = null;
      }
      return node;
    }

    const char = key[index];
    const child = node.children[char];
    if (!child) {
      return node;
    }

    node.children[char] = this.deleteRecursive(child, key, index + 1);
    if (Object.keys(node.children).length === 0 && node.value === null) {
      return null;
    }

    return node;
  }

  getProof(key: string): string[] {
    const proof: string[] = [];
    this.getProofRecursive(this.root, key, 0, proof);
    return proof;
  }

  private getProofRecursive(node: TrieNode, key: string, index: number, proof: string[]): boolean {
    if (index === key.length) {
      if (node.value !== null) {
        proof.push(this.nodeToHex(node));
        return true;
      }
      return false;
    }

    const char = key[index];
    const child = node.children[char];
    if (child) {
      proof.push(this.nodeToHex(node));
      if (this.getProofRecursive(child, key, index + 1, proof)) {
        return true;
      }
    }

    return false;
  }

  verify(key: string, proof: string[], expectedRoot: string): boolean {
    let currentRoot = this.root;
    for (const nodeHex of proof) {
      const node = this.hexToNode(nodeHex);
      const char = key[currentRoot.key.length];
      if (!node.children[char]) {
        return false;
      }
      currentRoot = node.children[char];
    }
    return this.nodeToHex(currentRoot) === expectedRoot;
  }

  private nodeToHex(node: TrieNode): string {
    return keccak256(JSON.stringify(node));
  }

  private hexToNode(hex: string): TrieNode {
    return JSON.parse(Buffer.from(hex, 'hex').toString());
  }
}

export { MerklePatriciaTrie };