import MerklePatriciaTrie from './merkle_patricia_trie';

describe('MerklePatriciaTrie', () => {
  let trie: MerklePatriciaTrie;

  beforeEach(() => {
    trie = new MerklePatriciaTrie();
  });

  it('should insert and retrieve values', () => {
    trie.set('key1', 'value1');
    trie.set('key2', 'value2');
    trie.set('key3', 'value3');

    expect(trie.get('key1')).toBe('value1');
    expect(trie.get('key2')).toBe('value2');
    expect(trie.get('key3')).toBe('value3');
  });

  it('should delete values', () => {
    trie.set('key1', 'value1');
    trie.set('key2', 'value2');
    trie.set('key3', 'value3');

    trie.delete('key2');

    expect(trie.get('key1')).toBe('value1');
    expect(trie.get('key2')).toBeNull();
    expect(trie.get('key3')).toBe('value3');
  });

  it('should generate Merkle proofs', () => {
    trie.set('key1', 'value1');
    trie.set('key2', 'value2');
    trie.set('key3', 'value3');

    const proof = trie.getProof('key2');
    expect(proof.length).toBeGreaterThan(0);
  });

  it('should calculate the root hash', () => {
    trie.set('key1', 'value1');
    trie.set('key2', 'value2');
    trie.set('key3', 'value3');

    const rootHash = trie.getRootHash();
    expect(rootHash).toBeDefined();
    expect(typeof rootHash).toBe('string');
  });
});