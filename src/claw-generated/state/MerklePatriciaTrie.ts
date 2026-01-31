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

export default MerklePatriciaTrie;