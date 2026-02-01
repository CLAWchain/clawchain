/**
 * Merkle Patricia Trie implementation for ClawChain state management.
 */
export class MerklePatriciaTrie {
  private root: TrieNode | null = null;

  insert(key: string, value: any): void {
    this.root = this.insertRecursive(this.root, key, value, 0);
  }

  private insertRecursive(
    node: TrieNode | null,
    key: string,
    value: any,
    index: number
  ): TrieNode {
    // ... (insert implementation from previous step)
  }

  lookup(key: string): any {
    return this.lookupRecursive(this.root, key, 0);
  }

  private lookupRecursive(
    node: TrieNode | null,
    key: string,
    index: number
  ): any {
    // ... (lookup implementation from previous step)
  }

  update(key: string, value: any): void {
    this.root = this.updateRecursive(this.root, key, value, 0);
  }

  private updateRecursive(
    node: TrieNode | null,
    key: string,
    value: any,
    index: number
  ): TrieNode | null {
    if (!node) {
      return this.insertRecursive(null, key, value, 0);
    }

    if (index === key.length) {
      node.value = value;
      return node;
    }

    const currentChar = key[index];
    const childNode = node.children.get(currentChar);
    if (childNode) {
      node.children.set(currentChar, this.updateRecursive(childNode, key, value, index + 1));
    } else {
      node.children.set(currentChar, this.insertRecursive(null, key.slice(index), value, 0));
    }

    return node;
  }

  delete(key: string): void {
    this.root = this.deleteRecursive(this.root, key, 0);
  }

  private deleteRecursive(
    node: TrieNode | null,
    key: string,
    index: number
  ): TrieNode | null {
    if (!node) {
      return null;
    }

    if (index === key.length) {
      if (node.children.size === 0) {
        return null;
      } else {
        node.value = null;
        return node;
      }
    }

    const currentChar = key[index];
    const childNode = node.children.get(currentChar);
    if (childNode) {
      node.children.set(currentChar, this.deleteRecursive(childNode, key, index + 1));
      if (node.children.size === 0 && node.value === null) {
        return null;
      }
    }

    return node;
  }
}

class TrieNode {
  key: string;
  value: any;
  children: Map<string, TrieNode>;

  constructor(key: string, value: any) {
    this.key = key;
    this.value = value;
    this.children = new Map();
  }
}