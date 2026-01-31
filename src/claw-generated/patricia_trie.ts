import { Hash, Bytes } from '../types';
import { keccak256 } from 'js-sha3';

class PatriciaTrie {
  private root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  get(key: Bytes): Bytes | null {
    let node: TrieNode | null = this.root;
    for (const byte of key) {
      node = node.getChild(byte);
      if (!node) {
        return null;
      }
    }
    return node.getValue();
  }

  set(key: Bytes, value: Bytes): void {
    this.root = this.setRecursive(this.root, key, 0, value);
  }

  private setRecursive(node: TrieNode, key: Bytes, index: number, value: Bytes): TrieNode {
    if (index === key.length) {
      node.setValue(value);
      return node;
    }

    const currentByte = key[index];
    let child = node.getChild(currentByte);
    if (!child) {
      child = new TrieNode();
      node.addChild(currentByte, child);
    }

    child = this.setRecursive(child, key, index + 1, value);
    node.addChild(currentByte, child);
    return node;
  }

  delete(key: Bytes): void {
    this.root = this.deleteRecursive(this.root, key, 0);
  }

  private deleteRecursive(node: TrieNode, key: Bytes, index: number): TrieNode {
    if (index === key.length) {
      if (node.getValue() !== null) {
        node.setValue(null);
      }
      return node;
    }

    const currentByte = key[index];
    const child = node.getChild(currentByte);
    if (!child) {
      return node;
    }

    const newChild = this.deleteRecursive(child, key, index + 1);
    if (newChild.getValue() === null && newChild.getChildren().size === 0) {
      node.removeChild(currentByte);
    } else {
      node.addChild(currentByte, newChild);
    }

    return node;
  }

  getStateRoot(): Hash {
    return this.root.hash();
  }

  verifyProof(key: Bytes, proof: Bytes[]): boolean {
    let node: TrieNode | null = this.root;
    for (const step of proof) {
      node = node.getChild(step);
      if (!node) {
        return false;
      }
    }
    return node.getValue() !== null && bytesEqual(node.getValue()!, key);
  }

  private bytesEqual(a: Bytes, b: Bytes): boolean {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }
}

class TrieNode {
  private key: Bytes | null;
  private value: Bytes | null;
  private children: Map<Bytes, TrieNode>;

  constructor() {
    this.key = null;
    this.value = null;
    this.children = new Map();
  }

  setKey(key: Bytes): void {
    this.key = key;
  }

  setValue(value: Bytes): void {
    this.value = value;
  }

  getValue(): Bytes | null {
    return this.value;
  }

  getChild(path: Bytes): TrieNode | null {
    return this.children.get(path) || null;
  }

  addChild(path: Bytes, child: TrieNode): void {
    this.children.set(path, child);
  }

  removeChild(path: Bytes): void {
    this.children.delete(path);
  }

  getChildren(): Map<Bytes, TrieNode> {
    return this.children;
  }

  hash(): Hash {
    const childHashes = Array.from(this.children.values())
      .map(child => child.hash());
    const nodeData = this.key ? this.key.concat(this.value!) : this.value!;
    const hash = keccak256(nodeData.concat(childHashes.join('')));
    return hash as Hash;
  }
}

function bytesEqual(a: Bytes, b: Bytes): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}