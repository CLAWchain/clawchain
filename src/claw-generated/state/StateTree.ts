import { StateNode } from './StateNode';
import { keccak256 } from 'js-sha3';

export class StateTree {
  private root: StateNode | null;

  constructor() {
    this.root = null;
  }

  insert(key: Uint8Array, value: Uint8Array): void {
    // Existing insert implementation
  }

  get(key: Uint8Array): Uint8Array | null {
    // Existing get implementation
  }

  delete(key: Uint8Array): void {
    // Existing delete implementation
  }

  getRootHash(): Uint8Array {
    if (!this.root) {
      return new Uint8Array();
    }
    return this.root.getHash();
  }

  private calculateNodeHash(node: StateNode): Uint8Array {
    const keyHash = keccak256(node.getKey());
    const valueHash = keccak256(node.getValue());
    const childHashes = Array.from(node.getChildren().values())
      .map(child => child.getHash())
      .sort((a, b) => Buffer.compare(a, b))
      .reduce((acc, hash) => acc + keccak256(hash), '');
    return keccak256(keyHash + valueHash + childHashes);
  }

  private findSharedPrefix(key1: Uint8Array, key2: Uint8Array): Uint8Array {
    // Existing findSharedPrefix implementation
  }

  // Implement other methods for the StateTree
}