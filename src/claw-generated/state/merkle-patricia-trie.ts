// src/claw-generated/state/merkle-patricia-trie.ts
import { keccak256 } from 'js-sha3';

export class MerklePatriciaTrie {
  private root: TrieNode | null;
  private rootHash: string | null;

  constructor() {
    this.root = null;
    this.rootHash = null;
  }

  insert(key: string, value: string): void {
    // Existing insert logic...
  }

  get(key: string): string | null {
    const node = this.getRecursive(this.root, key, 0);
    return node ? node.value : null;
  }

  private getRecursive(node: TrieNode | null, key: string, index: number): TrieNode | null {
    if (!node) {
      return null;
    }

    if (index === key.length) {
      return node;
    }

    const currentChar = key[index];
    const childNode = node.children.get(currentChar);
    return this.getRecursive(childNode, key, index + 1);
  }

  delete(key: string): void {
    this.root = this.deleteRecursive(this.root, key, 0);
    this.updateRootHash();
  }

  private deleteRecursive(node: TrieNode | null, key: string, index: number): TrieNode | null {
    if (!node) {
      return null;
    }

    if (index === key.length) {
      if (node.children.size === 0) {
        return null;
      }
      node.value = '';
      return node;
    }

    const currentChar = key[index];
    const childNode = node.children.get(currentChar);
    if (!childNode) {
      return node;
    }

    node.children.set(currentChar, this.deleteRecursive(childNode, key, index + 1));
    if (node.children.size === 0 && node.value === '') {
      return null;
    }

    return node;
  }

  private updateRootHash(): void {
    // Existing updateRootHash logic...
  }

  private getRootHash(node: TrieNode | null): string {
    // Existing getRootHash logic...
  }
}

class TrieNode {
  // Existing TrieNode implementation...
}