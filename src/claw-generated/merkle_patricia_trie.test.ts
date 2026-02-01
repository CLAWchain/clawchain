import MerklePatriciaTrie from './merkle_patricia_trie';
import { hash, HexString } from '../state/crypto';

describe('MerklePatriciaTrie', () => {
  it('should store and retrieve values correctly', () => {
    const trie = new MerklePatriciaTrie();
    trie.set('0x01', '0x0123');
    trie.set('0x02', '0x4567');
    trie.set('0x0102', '0x89ab');

    expect(trie.get('0x01')).toEqual('0x0123');
    expect(trie.get('0x02')).toEqual('0x4567');
    expect(trie.get('0x0102')).toEqual('0x89ab');
    expect(trie.get('0x03')).toBeNull();
  });

  it('should generate and verify Merkle proofs', () => {
    const trie = new MerklePatriciaTrie();
    trie.set('0x01', '0x0123');
    trie.set('0x02', '0x4567');
    trie.set('0x0102', '0x89ab');

    const proof1 = trie.generateProof('0x01');
    const proof2 = trie.generateProof('0x02');
    const proof3 = trie.generateProof('0x0102');

    expect(trie.verifyProof('0x01', '0x0123', proof1)).toBe(true);
    expect(trie.verifyProof('0x02', '0x4567', proof2)).toBe(true);
    expect(trie.verifyProof('0x0102', '0x89ab', proof3)).toBe(true);
    expect(trie.verifyProof('0x01', '0x4567', proof1)).toBe(false);
    expect(trie.verifyProof('0x02', '0x0123', proof2)).toBe(false);
    expect(trie.verifyProof('0x0102', '0x0123', proof3)).toBe(false);
  });
});