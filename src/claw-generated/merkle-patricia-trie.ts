// src/claw-generated/merkle-patricia-trie.ts

import { keccak256 } from 'js-sha3';

interface TrieNode {
  key: string;
  value: string;
  children: { [key: string]: TrieNode };
}

class MerklePatriciaTrie {
  private root: TrieNode;

  constructor() {
    this.root = {
      key: '',
      value: '',
      children: {},
    };
  }

  insert(key: string, value: string): void {
    this.insertRecursive(this.root, key, value, 0);
  }

  private insertRecursive(
    node: TrieNode,
    key: string,
    value: string,
    index: number
  ): void {
    if (index === key.length) {
      node.value = value;
      return;
    }

    const currentChar = key[index];
    if (!node.children[currentChar]) {
      node.children[currentChar] = {
        key: currentChar,
        value: '',
        children: {},
      };
    }

    this.insertRecursive(node.children[currentChar], key, value, index + 1);
  }

  get(key: string): string | null {
    return this.getRecursive(this.root, key, 0);
  }

  private getRecursive(node: TrieNode, key: string, index: number): string | null {
    if (index === key.length) {
      return node.value || null;
    }

    const currentChar = key[index];
    if (!node.children[currentChar]) {
      return null;
    }

    return this.getRecursive(node.children[currentChar], key, index + 1);
  }

  delete(key: string): void {
    this.deleteRecursive(this.root, key, 0);
  }

  private deleteRecursive(
    node: TrieNode,
    key: string,
    index: number
  ): boolean {
    if (index === key.length) {
      if (node.value !== '') {
        node.value = '';
        return Object.keys(node.children).length === 0;
      }
      return false;
    }

    const currentChar = key[index];
    const child = node.children[currentChar];
    if (!child) {
      return false;
    }

    const shouldDeleteChild = this.deleteRecursive(child, key, index + 1);
    if (shouldDeleteChild) {
      delete node.children[currentChar];
      return (
        Object.keys(node.children).length === 0 && node.value === ''
      );
    }

    return false;
  }

  getRootHash(): string {
    return this.hashNode(this.root);
  }

  private hashNode(node: TrieNode): string {
    const sortedKeys = Object.keys(node.children).sort();
    const childHashes = sortedKeys.map((key) =>
      this.hashNode(node.children[key])
    );
    const nodeData = `${node.key}:${node.value}:${childHashes.join(',')}`;
    return keccak256(nodeData);
  }
}

export default MerklePatriciaTrie;