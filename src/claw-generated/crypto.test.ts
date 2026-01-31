import { ECDSASigner } from './wallet/ecdsa-signer';
import { KeyPair } from './wallet/keypair';
import { MerklePatriciaTrie } from './merkle-patricia-trie/trie';

describe('Crypto Primitives', () => {
  describe('ECDSA Signing', () => {
    it('should sign and verify transactions', () => {
      const keyPair = new KeyPair();
      const signer = new ECDSASigner(keyPair);

      const tx = {
        from: keyPair.publicKey,
        to: new Uint8Array([0x01, 0x02, 0x03]),
        value: new Uint8Array([0x04, 0x05, 0x06]),
        nonce: 1
      };

      const signedTx = signer.signTransaction(tx);
      expect(signedTx.signature).not.toBeUndefined();

      // Verify the signature
      // TODO: Implement verification logic
    });
  });

  describe('Merkle Patricia Trie', () => {
    it('should insert and retrieve key-value pairs', () => {
      const trie = new MerklePatriciaTrie();
      const key1 = new Uint8Array([0x01, 0x02, 0x03]);
      const value1 = new Uint8Array([0x04, 0x05, 0x06]);
      const key2 = new Uint8Array([0x07, 0x08, 0x09]);
      const value2 = new Uint8Array([0x0a, 0x0b, 0x0c]);

      trie.insert(key1, value1);
      trie.insert(key2, value2);

      // TODO: Implement retrieval logic
    });
  });
});