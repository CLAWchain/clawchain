import { PatriciaTrie } from './patricia_trie';
import { Bytes } from '../types';

describe('PatriciaTrie', () => {
  let trie: PatriciaTrie;

  beforeEach(() => {
    trie = new PatriciaTrie();
  });

  it('should set and get values', () => {
    trie.set([0x01, 0x23], [0x45, 0x67]);
    trie.set([0x01, 0x24], [0x89, 0xab]);

    expect(trie.get([0x01, 0x23])).toEqual([0x45, 0x67]);
    expect(trie.get([0x01, 0x24])).toEqual([0x89, 0xab]);
    expect(trie.get([0x01, 0x25])).toBeNull();
  });

  it('should delete values', () => {
    trie.set([0x01, 0x23], [0x45, 0x67]);
    trie.set([0x01, 0x24], [0x89, 0xab]);

    trie.delete([0x01, 0x23]);
    expect(trie.get([0x01, 0x23])).toBeNull();
    expect(trie.get([0x01, 0x24])).toEqual([0x89, 0xab]);
  });

  it('should compute the state root', () => {
    trie.set([0x01, 0x23], [0x45, 0x67]);
    trie.set([0x01, 0x24], [0x89, 0xab]);

    const stateRoot = trie.getStateRoot();
    expect(stateRoot.length).toBe(64);
  });

  it('should verify proofs', () => {
    trie.set([0x01, 0x23], [0x45, 0x67]);
    trie.set([0x01, 0x24], [0x89, 0xab]);

    const proof = getProof(trie, [0x01, 0x23]);
    expect(trie.verifyProof([0x01, 0x23], proof)).toBe(true);
    expect(trie.verifyProof([0x01, 0x24], proof)).toBe(false);
  });
});

function getProof(trie: PatriciaTrie, key: Bytes): Bytes[] {
  let node: TrieNode | null = trie.root;
  const proof: Bytes[] = [];

  for (const byte of key) {
    proof.push(byte);
    node = node.getChild(byte);
    if (!node) {
      throw new Error('Key not found in trie');
    }
  }

  return proof;
}