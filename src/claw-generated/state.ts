import { hash } from '../crypto/hash';

class StateNode {
  key: string;
  value: any;
  children: StateNode[];

  constructor(key: string, value: any, children: StateNode[] = []) {
    this.key = key;
    this.value = value;
    this.children = children;
  }

  getHash(): string {
    return hash(JSON.stringify(this));
  }
}

export class MerklePatriciaTrie {
  root: StateNode | null;

  constructor() {
    this.root = null;
  }

  insert(key: string, value: any): void {
    if (!this.root) {
      this.root = new StateNode(key, value);
      return;
    }

    let currentNode = this.root;
    let keyIndex = 0;

    while (true) {
      if (currentNode.key === key) {
        currentNode.value = value;
        return;
      }

      const commonPrefix = this.findCommonPrefix(key, currentNode.key);
      if (commonPrefix > 0) {
        // Split the current node
        const newNode = new StateNode(
          currentNode.key.slice(commonPrefix),
          currentNode.value,
          [currentNode]
        );
        currentNode.key = key.slice(0, commonPrefix);
        currentNode.value = null;
        currentNode.children = [newNode];

        if (keyIndex === key.length) {
          newNode.children.push(new StateNode(key.slice(commonPrefix), value));
        } else {
          newNode.children.push(new StateNode(key.slice(commonPrefix), value, []));
        }
        return;
      }

      const nextChar = key[keyIndex];
      const childIndex = currentNode.children.findIndex(
        (child) => child.key[0] === nextChar
      );
      if (childIndex !== -1) {
        currentNode = currentNode.children[childIndex];
        keyIndex++;
      } else {
        currentNode.children.push(new StateNode(key.slice(keyIndex), value, []));
        return;
      }
    }
  }

  findCommonPrefix(a: string, b: string): number {
    let i = 0;
    while (a[i] === b[i] && i < Math.min(a.length, b.length)) {
      i++;
    }
    return i;
  }

  get(key: string): any {
    if (!this.root) {
      return null;
    }

    let currentNode = this.root;
    let keyIndex = 0;

    while (true) {
      if (currentNode.key === key) {
        return currentNode.value;
      }

      const commonPrefix = this.findCommonPrefix(key, currentNode.key);
      if (commonPrefix > 0) {
        // The key is a prefix of the current node's key
        if (keyIndex === key.length) {
          return currentNode.value;
        } else {
          // Continue traversal
          keyIndex += commonPrefix;
          currentNode = new StateNode(
            currentNode.key.slice(commonPrefix),
            currentNode.value,
            currentNode.children
          );
        }
      } else {
        // The key does not match the current node's key
        const nextChar = key[keyIndex];
        const childIndex = currentNode.children.findIndex(
          (child) => child.key[0] === nextChar
        );
        if (childIndex !== -1) {
          currentNode = currentNode.children[childIndex];
          keyIndex++;
        } else {
          // Key not found
          return null;
        }
      }
    }
  }

  generateProof(key: string): any[] {
    // TODO: Implement proof generation
  }

  verify(key: string, proof: any[], expectedRoot: string): boolean {
    // TODO: Implement proof verification
  }
}