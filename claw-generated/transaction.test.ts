import { Transaction } from './transaction';
import { Account } from '../account/account';

describe('Transaction', () => {
  it('should verify a valid signature', () => {
    const senderAccount = new Account('sender-public-key', 100, 0);
    const transaction = new Transaction(
      senderAccount.publicKey,
      'recipient-address',
      10,
      0,
      'valid-signature'
    );

    expect(transaction.verifySignature(senderAccount)).toBe(true);
  });

  it('should detect an invalid signature', () => {
    const senderAccount = new Account('sender-public-key', 100, 0);
    const transaction = new Transaction(
      senderAccount.publicKey,
      'recipient-address',
      10,
      0,
      'invalid-signature'
    );

    expect(transaction.verifySignature(senderAccount)).toBe(false);
  });

  it('should validate a correct nonce', () => {
    const senderAccount = new Account('sender-public-key', 100, 0);
    const transaction = new Transaction(
      senderAccount.publicKey,
      'recipient-address',
      10,
      0,
      'valid-signature'
    );

    expect(transaction.validateNonce(senderAccount)).toBe(true);
  });

  it('should detect an invalid nonce', () => {
    const senderAccount = new Account('sender-public-key', 100, 1);
    const transaction = new Transaction(
      senderAccount.publicKey,
      'recipient-address',
      10,
      0,
      'valid-signature'
    );

    expect(transaction.validateNonce(senderAccount)).toBe(false);
  });

  it('should validate a sufficient balance', () => {
    const senderAccount = new Account('sender-public-key', 100, 0);
    const transaction = new Transaction(
      senderAccount.publicKey,
      'recipient-address',
      10,
      0,
      'valid-signature'
    );

    expect(transaction.validateBalance(senderAccount)).toBe(true);
  });

  it('should detect an insufficient balance', () => {
    const senderAccount = new Account('sender-public-key', 5, 0);
    const transaction = new Transaction(
      senderAccount.publicKey,
      'recipient-address',
      10,
      0,
      'valid-signature'
    );

    expect(transaction.validateBalance(senderAccount)).toBe(false);
  });
});