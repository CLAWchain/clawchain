import { keccak256 } from 'js-sha3';

class MerklePatriciaTrie {
  private root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  set(key: string, value: any): void {
    this.updateNode(this.root, key, value, 0);
  }

  get(key: string): any {
    let node = this.root;
    for (let i = 0; i < key.length; i++) {
      const childIndex = parseInt(key[i], 16);
      if (!node.children[childIndex]) {
        return null;
      }
      node = node.children[childIndex];
    }
    return node.value;
  }

  generateProof(key: string): Uint8Array {
    const proof: TrieNode[] = [];
    this.generateProofRecursive(this.root, key, 0, proof);
    return this.serializeProof(proof);
  }

  verifyProof(key: string, value: any, proof: Uint8Array): boolean {
    const nodes = this.deserializeProof(proof);
    let node = this.root;
    for (let i = 0; i < nodes.length; i++) {
      const childIndex = parseInt(key[i], 16);
      if (!node.children[childIndex] || !nodes[i].equals(node.children[childIndex])) {
        return false;
      }
      node = node.children[childIndex];
    }
    return node.value === value;
  }

  private updateNode(node: TrieNode, key: string, value: any, index: number): void {
    if (index === key.length) {
      node.value = value;
      return;
    }

    const childIndex = parseInt(key[index], 16);
    if (!node.children[childIndex]) {
      node.children[childIndex] = new TrieNode();
    }
    this.updateNode(node.children[childIndex], key, value, index + 1);
  }

  private generateProofRecursive(node: TrieNode, key: string, index: number, proof: TrieNode[]): void {
    proof.push(node);
    if (index === key.length) {
      return;
    }

    const childIndex = parseInt(key[index], 16);
    if (!node.children[childIndex]) {
      return;
    }
    this.generateProofRecursive(node.children[childIndex], key, index + 1, proof);
  }

  private serializeProof(proof: TrieNode[]): Uint8Array {
    const serializedNodes = proof.map(node => node.serialize());
    return new Uint8Array(serializedNodes.reduce((acc, node) => [...acc, ...node], []));
  }

  private deserializeProof(proof: Uint8Array): TrieNode[] {
    const nodes = [];
    let offset = 0;
    while (offset < proof.length) {
      const node = TrieNode.deserialize(proof.slice(offset));
      nodes.push(node);
      offset += node.serialize().length;
    }
    return nodes;
  }
}

class TrieNode {
  value: any;
  children: TrieNode[];

  constructor() {
    this.value = null;
    this.children = new Array(16).fill(null);
  }

  serialize(): Uint8Array {
    const childrenData = this.children.flatMap(child => child?.serialize() || []);
    const valueData = this.value !== null ? this.hashValue(this.value) : new Uint8Array([]);
    return new Uint8Array([...valueData, ...childrenData]);
  }

  static deserialize(data: Uint8Array): TrieNode {
    const node = new TrieNode();
    let offset = 0;
    if (data.length > 0) {
      node.value = this.deserializeValue(data.slice(offset));
      offset += this.deserializeValueLength(data.slice(offset));
    }
    for (let i = 0; i < 16; i++) {
      if (offset < data.length) {
        node.children[i] = TrieNode.deserialize(data.slice(offset));
        offset += node.children[i].serialize().length;
      }
    }
    return node;
  }

  private hashValue(value: any): Uint8Array {
    return new Uint8Array(Buffer.from(keccak256(JSON.stringify(value)), 'hex'));
  }

  private static deserializeValue(data: Uint8Array): any {
    return JSON.parse(Buffer.from(data).toString());
  }

  private static deserializeValueLength(data: Uint8Array): number {
    return data[0];
  }

  equals(other: TrieNode): boolean {
    return this.serialize().every((byte, i) => byte === other.serialize()[i]);
  }
}

export { MerklePatriciaTrie };