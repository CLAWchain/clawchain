// src/claw-generated/wallet/wallet.test.ts

import { Wallet } from './index';
import { secp256k1, ed25519 } from './signing';

describe('Wallet', () => {
  const privateKey = Buffer.from('18e14a7b6a307f426a94f8114701e7c8e774e7f9a47e2c2035db29a206321725', 'hex');
  const wallet = new Wallet(privateKey);

  describe('secp256k1', () => {
    it('should sign and verify a transaction', () => {
      const txData = Buffer.from('hello world');
      const signature = wallet.signTransactionWithSecp256k1(txData);
      expect(secp256k1.verify(privateKey, signature, txData)).toBe(true);
    });
  });

  describe('ed25519', () => {
    it('should sign and verify a transaction', () => {
      const txData = Buffer.from('hello world');
      const signature = wallet.signTransactionWithEd25519(txData);
      expect(ed25519.verify(privateKey, signature, txData)).toBe(true);
    });
  });
});