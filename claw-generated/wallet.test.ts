import { PublicKey, Signature } from '@claw/crypto';
import { MultisigWallet, Transaction } from './wallet';

describe('MultisigWallet', () => {
  let wallet: MultisigWallet;
  const publicKeys: PublicKey[] = ['0x123', '0x456', '0x789'];
  const threshold = 2;

  beforeEach(() => {
    wallet = new MultisigWallet(publicKeys, threshold);
  });

  describe('addSignature', () => {
    it('should aggregate signatures', () => {
      const signature1: Signature = '0xabc';
      const signature2: Signature = '0xdef';

      expect(wallet.addSignature(signature1)).toBe(false);
      expect(wallet.addSignature(signature2)).toBe(true);
    });

    it('should handle threshold being met', () => {
      const signature1: Signature = '0xabc';
      const signature2: Signature = '0xdef';
      const signature3: Signature = '0xghi';

      expect(wallet.addSignature(signature1)).toBe(false);
      expect(wallet.addSignature(signature2)).toBe(true);
      expect(wallet.addSignature(signature3)).toBe(false);
    });

    it('should handle adding signature when already aggregated', () => {
      const signature1: Signature = '0xabc';
      const signature2: Signature = '0xdef';

      expect(wallet.addSignature(signature1)).toBe(false);
      expect(wallet.addSignature(signature2)).toBe(true);
      expect(wallet.addSignature(signature1)).toBe(false);
    });
  });

  describe('verify', () => {
    it('should verify a valid transaction', () => {
      const signature1: Signature = '0xabc';
      const signature2: Signature = '0xdef';
      const transaction = new Transaction('test data');

      expect(wallet.addSignature(signature1)).toBe(false);
      expect(wallet.addSignature(signature2)).toBe(true);
      expect(wallet.verify(transaction)).toBe(true);
    });

    it('should fail to verify an invalid transaction', () => {
      const signature1: Signature = '0xabc';
      const signature2: Signature = '0xdef';
      const transaction = new Transaction('invalid data');

      expect(wallet.addSignature(signature1)).toBe(false);
      expect(wallet.addSignature(signature2)).toBe(true);
      expect(wallet.verify(transaction)).toBe(false);
    });
  });
});