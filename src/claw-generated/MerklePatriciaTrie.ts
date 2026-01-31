import crypto from 'crypto';

interface TrieNode {
  key: string;
  value?: string;
  children: Map<string, TrieNode>;
}

export class MerklePatriciaTrie {
  private root: TrieNode = {
    key: '',
    children: new Map()
  };

  // Insert a key-value pair into the trie
  insert(key: string, value: string): void {
    this.insertRecursive(this.root, key.split('/'), value);
  }

  private insertRecursive(node: TrieNode, keyParts: string[], value: string): void {
    if (keyParts.length === 0) {
      node.value = value;
      return;
    }

    const currentKey = keyParts.shift()!;
    let childNode = node.children.get(currentKey);
    if (!childNode) {
      childNode = {
        key: currentKey,
        children: new Map()
      };
      node.children.set(currentKey, childNode);
    }

    this.insertRecursive(childNode, keyParts, value);
  }

  // Get the value for a given key
  get(key: string): string | undefined {
    return this.getRecursive(this.root, key.split('/'));
  }

  private getRecursive(node: TrieNode, keyParts: string[]): string | undefined {
    if (keyParts.length === 0) {
      return node.value;
    }

    const currentKey = keyParts.shift()!;
    const childNode = node.children.get(currentKey);
    if (!childNode) {
      return undefined;
    }

    return this.getRecursive(childNode, keyParts);
  }

  // Generate a Merkle proof for a given key
  generateProof(key: string): string[] {
    const proof: string[] = [];
    this.generateProofRecursive(this.root, key.split('/'), proof);
    return proof;
  }

  private generateProofRecursive(node: TrieNode, keyParts: string[], proof: string[]): void {
    if (keyParts.length === 0) {
      proof.push(this.hash(JSON.stringify(node)));
      return;
    }

    const currentKey = keyParts.shift()!;
    const childNode = node.children.get(currentKey);
    if (!childNode) {
      return;
    }

    proof.push(this.hash(JSON.stringify(childNode)));
    this.generateProofRecursive(childNode, keyParts, proof);
  }

  // Calculate the root hash of the trie
  getRootHash(): string {
    return this.hash(JSON.stringify(this.root));
  }

  private hash(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex');
  }
}