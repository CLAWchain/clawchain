import { hash } from '../utils/crypto';

export class MerklePatriciaTrie {
  private root: TrieNode | null = null;

  insert(key: string, value: any): void {
    this.root = this.insertRecursive(this.root, key, value);
  }

  private insertRecursive(node: TrieNode | null, key: string, value: any): TrieNode {
    // ... (insert implementation from previous step)
  }

  get(key: string): any | undefined {
    return this.getRecursive(this.root, key);
  }

  private getRecursive(node: TrieNode | null, key: string): any | undefined {
    if (!node) {
      return undefined;
    }

    const commonPrefix = this.findCommonPrefix(node.key, key);
    if (commonPrefix === node.key.length) {
      return node.value;
    }

    if (commonPrefix > 0) {
      // Partial key match, continue searching
      return this.getRecursive(node.children[key[commonPrefix]], key.slice(commonPrefix));
    }

    // No match, return undefined
    return undefined;
  }

  private findCommonPrefix(a: string, b: string): number {
    // ... (findCommonPrefix implementation from previous step)
  }

  private calculateNodeHash(node: TrieNode): string {
    // ... (calculateNodeHash implementation from previous step)
  }
}

export interface TrieNode {
  key: string;
  value: any;
  children: { [key: string]: TrieNode };
  hash: string;
}