import { hash } from 'crypto';

class TrieNode {
  key: string;
  value: any;
  nonce: number;
  children: Map<string, TrieNode>;

  constructor(key: string, value?: any, nonce?: number) {
    this.key = key;
    this.value = value;
    this.nonce = nonce || 0;
    this.children = new Map();
  }

  addChild(key: string, value?: any, nonce?: number) {
    this.children.set(key, new TrieNode(key, value, nonce));
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

  insert(key: string, value: any, nonce: number) {
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
    node.nonce = nonce;
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

  getNonce(key: string): number {
    let node = this.root;
    const keyParts = key.split('/');

    for (const part of keyParts) {
      const child = node.getChild(part);
      if (child) {
        node = child;
      } else {
        return 0;
      }
    }

    return node.nonce;
  }

  setNonce(key: string, nonce: number) {
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

    node.nonce = nonce;
  }

  getStateRoot(): string {
    return this.hash(this.root);
  }

  private hash(node: TrieNode): string {
    const childHashes = Array.from(node.children.values())
      .map(child => this.hash(child));
    const nodeData = `${node.key}:${node.value}:${node.nonce}:${childHashes.join(',')}`;
    return hash(nodeData, 'sha256').toString('hex');
  }
}