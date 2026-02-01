import { hash, hexToBytes, bytesToHex } from '../crypto';

export class MerklePatriciaTrie {
  private root: TrieNode | null = null;

  public insert(key: string, value: string): void {
    this.root = this.insertRecursive(this.root, key, value, 0);
  }

  private insertRecursive(
    node: TrieNode | null,
    key: string,
    value: string,
    index: number
  ): TrieNode {
    // ... insert implementation ...
  }

  public get(key: string): string | null {
    return this.getRecursive(this.root, key, 0);
  }

  private getRecursive(
    node: TrieNode | null,
    key: string,
    index: number
  ): string | null {
    // ... get implementation ...
  }

  public generateProof(key: string): TrieNode[] {
    const proof: TrieNode[] = [];
    this.generateProofRecursive(this.root, key, 0, proof);
    return proof;
  }

  private generateProofRecursive(
    node: TrieNode | null,
    key: string,
    index: number,
    proof: TrieNode[]
  ): boolean {
    if (!node) {
      return false;
    }

    proof.push(node);

    if (index === key.length) {
      return true;
    }

    const currentChar = key.charAt(index);
    const child = node.children[currentChar];
    return this.generateProofRecursive(child, key, index + 1, proof);
  }

  public verifyProof(
    key: string,
    value: string,
    proof: TrieNode[]
  ): boolean {
    const trie = new MerklePatriciaTrie();
    for (const node of proof) {
      trie.insert(node.key, node.value);
    }
    return trie.get(key) === value;
  }
}

export interface TrieNode {
  key: string;
  value: string;
  children: { [key: string]: TrieNode };
}