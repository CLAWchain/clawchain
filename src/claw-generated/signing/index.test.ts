// src/claw-generated/signing/index.test.ts

import { TransactionSigner } from './index';
import { ec as EC } from 'elliptic';
import * as nacl from 'tweetnacl';

describe('TransactionSigner', () => {
  describe('ECDSA', () => {
    it('should sign and verify transactions', () => {
      const secp256k1 = new EC('secp256k1');
      const keyPair = secp256k1.genKeyPair();
      const privateKey = keyPair.getPrivate().toArray();
      const publicKey = keyPair.getPublic().encode('array');

      const transaction = {
        from: '0x1234567890abcdef',
        to: '0x0987654321fedcba',
        value: 100,
        nonce: 1,
      };

      const signedTransaction = TransactionSigner.sign(
        transaction,
        Uint8Array.from(privateKey),
        'ecdsa'
      );

      expect(
        TransactionSigner.verify(
          signedTransaction,
          Uint8Array.from(publicKey),
          'ecdsa'
        )
      ).toBe(true);
    });
  });

  describe('Ed25519', () => {
    it('should sign and verify transactions', () => {
      const keyPair = nacl.sign.keyPair();
      const privateKey = keyPair.secretKey;
      const publicKey = keyPair.publicKey;

      const transaction = {
        from: '0x1234567890abcdef',
        to: '0x0987654321fedcba',
        value: 100,
        nonce: 1,
      };

      const signedTransaction = TransactionSigner.sign(
        transaction,
        privateKey,
        'ed25519'
      );

      expect(
        TransactionSigner.verify(signedTransaction, publicKey, 'ed25519')
      ).toBe(true);
    });
  });
});