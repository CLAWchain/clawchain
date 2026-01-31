import { keccak256 } from 'js-sha3';

export abstract class Node {
  abstract hash(): string;
}

export class RootNode extends Node {
  children: Map<string, Node> = new Map();

  hash(): string {
    // Implement Merkle root hash calculation
    return keccak256(JSON.stringify([...this.children.values()].map(child => child.hash())));
  }
}

export class ValueNode extends Node {
  value: any;

  constructor(value: any) {
    super();
    this.value = value;
  }

  hash(): string {
    // Implement value node hash calculation
    return keccak256(JSON.stringify(this.value));
  }
}

export function hash(value: any): string {
  return keccak256(JSON.stringify(value));
}