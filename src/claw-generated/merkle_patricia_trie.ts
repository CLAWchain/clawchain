import { keccak256 } from 'js-sha3';

interface TrieNode {
  key: string;
  value: string;
  children: { [key: string]: TrieNode };
}

class MerklePatriciaTrie {
  private root: TrieNode | null = null;

  insert(key: string, value: string): void {
    this.root = this.insertRecursive(this.root, key, value);
  }

  private insertRecursive(
    node: TrieNode | null,
    key: string,
    value: string
  ): TrieNode {
    if (!node) {
      return { key, value, children: {} };
    }

    const commonPrefix = this.findCommonPrefix(node.key, key);
    if (commonPrefix === node.key.length) {
      if (key.length === commonPrefix) {
        // Key already exists, update value
        node.value = value;
        return node;
      } else {
        // Key is a prefix of the current node, create new node
        const newNode: TrieNode = {
          key: key.slice(commonPrefix),
          value,
          children: {
            [key[commonPrefix]]: node
          }
        };
        return newNode;
      }
    } else {
      // Split the current node
      const newNode: TrieNode = {
        key: node.key.slice(commonPrefix),
        value: node.value,
        children: node.children
      };
      node.key = node.key.slice(0, commonPrefix);
      node.value = '';
      node.children = {
        [node.key[commonPrefix]]: newNode,
        [key[commonPrefix]]: this.insertRecursive(null, key.slice(commonPrefix), value)
      };
      return node;
    }
  }

  private findCommonPrefix(a: string, b: string): number {
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) {
      i++;
    }
    return i;
  }

  getRootHash(): string {
    return this.root ? this.hash(this.root) : '';
  }

  private hash(node: TrieNode): string {
    const nodeData = JSON.stringify({
      key: node.key,
      value: node.value,
      children: Object.keys(node.children).reduce((acc, childKey) => {
        acc[childKey] = this.hash(node.children[childKey]);
        return acc;
      }, {})
    });
    return keccak256(nodeData);
  }
}

export { MerklePatriciaTrie };