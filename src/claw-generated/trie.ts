import { hash } from 'crypto';

class TrieNode {
  key: string;
  value: any;
  children: Map<string, TrieNode>;

  constructor(key: string, value?: any) {
    this.key = key;
    this.value = value;
    this.children = new Map();
  }

  addChild(key: string, value?: any) {
    this.children.set(key, new TrieNode(key, value));
  }

  getChild(key: string): TrieNode | undefined {
    return this.children.get(key);
  }
}

export class MerklePatriciaTrie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode('');
  }

  insert(key: string, value: any) {
    let node = this.root;
    const keyParts = key.split('/');

    for (const part of keyParts) {
      const child = node.getChild(part);
      if (child) {
        node = child;
      } else {
        node.addChild(part);
        node = node.getChild(part)!;
      }
    }

    node.value = value;
  }

  get(key: string): any {
    let node = this.root;
    const keyParts = key.split('/');

    for (const part of keyParts) {
      const child = node.getChild(part);
      if (child) {
        node = child;
      } else {
        return undefined;
      }
    }

    return node.value;
  }

  getStateRoot(): string {
    return this.hash(this.root);
  }

  private hash(node: TrieNode): string {
    const childHashes = Array.from(node.children.values())
      .map(child => this.hash(child));
    const nodeData = `${node.key}:${node.value}:${childHashes.join(',')}`;
    return hash(nodeData, 'sha256').toString('hex');
  }
}