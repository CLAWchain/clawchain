// Merkle Patricia Trie implementation for ClawChain state
import { hash, HexString } from '../state/crypto';

type TrieNode = {
  key: HexString;
  value: HexString | null;
  children: { [key: string]: TrieNode };
};

class MerklePatriciaTrie {
  private root: TrieNode = {
    key: '',
    value: null,
    children: {},
  };

  /**
   * Get the value associated with a given key.
   * @param key - The key to look up.
   * @returns The value associated with the key, or null if not found.
   */
  get(key: HexString): HexString | null {
    let node: TrieNode = this.root;
    for (let i = 0; i < key.length; i += 2) {
      const nibble = key.slice(i, i + 2);
      if (!node.children[nibble]) {
        return null;
      }
      node = node.children[nibble];
    }
    return node.value;
  }

  /**
   * Set the value associated with a given key.
   * @param key - The key to set.
   * @param value - The value to associate with the key.
   */
  set(key: HexString, value: HexString): void {
    let node: TrieNode = this.root;
    for (let i = 0; i < key.length; i += 2) {
      const nibble = key.slice(i, i + 2);
      if (!node.children[nibble]) {
        node.children[nibble] = {
          key: nibble,
          value: null,
          children: {},
        };
      }
      node = node.children[nibble];
    }
    node.value = value;
  }

  /**
   * Generate a Merkle proof for a given key.
   * @param key - The key to generate a proof for.
   * @returns The Merkle proof for the key.
   */
  generateProof(key: HexString): HexString[] {
    const proof: HexString[] = [];
    let node: TrieNode = this.root;
    for (let i = 0; i < key.length; i += 2) {
      const nibble = key.slice(i, i + 2);
      proof.push(hash(JSON.stringify(node.children[nibble])));
      node = node.children[nibble];
    }
    proof.push(hash(JSON.stringify(node)));
    return proof;
  }

  /**
   * Verify a Merkle proof for a given key and value.
   * @param key - The key to verify.
   * @param value - The expected value.
   * @param proof - The Merkle proof to verify.
   * @returns True if the proof is valid, false otherwise.
   */
  verifyProof(key: HexString, value: HexString, proof: HexString[]): boolean {
    let node: TrieNode = this.root;
    for (let i = 0; i < key.length; i += 2) {
      const nibble = key.slice(i, i + 2);
      const childHash = hash(JSON.stringify(node.children[nibble]));
      if (proof.length === 0 || childHash !== proof[0]) {
        return false;
      }
      proof.shift();
      node = node.children[nibble];
    }
    const nodeHash = hash(JSON.stringify(node));
    return proof.length === 1 && nodeHash === proof[0] && node.value === value;
  }
}

export default MerklePatriciaTrie;