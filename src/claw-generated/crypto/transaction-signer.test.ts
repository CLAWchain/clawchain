// src/claw-generated/crypto/transaction-signer.test.ts

import { TransactionSigner } from './transaction-signer';

describe('TransactionSigner', () => {
  let signer: TransactionSigner;

  beforeEach(() => {
    signer = new TransactionSigner();
  });

  it('should sign and verify a transaction', () => {
    const transaction = {
      to: '0x1234567890123456789012345678901234567890',
      value: 1000,
      nonce: 0
    };
    const privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123';

    const signedTransaction = signer.signTransaction(transaction, privateKey);
    expect(signer.verifyTransaction(signedTransaction)).toBe(true);
  });
});