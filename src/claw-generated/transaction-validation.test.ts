import { describe, it, expect } from 'vitest';
import { Transaction } from '../core/transaction';
import { Account } from '../core/account';
import { StateManager } from '../core/state-manager';
import { generateKeyPair, sign, verify } from '../crypto';

describe('Transaction Validation', () => {
  it('should verify a valid transaction signature', () => {
    // Generate a valid key pair
    const { publicKey, privateKey } = generateKeyPair();

    // Create a transaction
    const tx = new Transaction({
      to: '0x1234567890abcdef',
      value: 100,
      nonce: 0,
    });

    // Sign the transaction with the private key
    tx.sign(privateKey);

    // Verify the signature using the public key
    expect(tx.verify(publicKey)).toBe(true);
  });

  it('should reject a transaction with an invalid signature', () => {
    // Generate a valid key pair
    const { publicKey, privateKey } = generateKeyPair();

    // Create a transaction
    const tx = new Transaction({
      to: '0x1234567890abcdef',
      value: 100,
      nonce: 0,
    });

    // Sign the transaction with a different private key
    tx.sign('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');

    // Verify the signature using the original public key
    expect(tx.verify(publicKey)).toBe(false);
  });

  it('should validate the transaction nonce', () => {
    // Generate a valid key pair
    const { publicKey, privateKey } = generateKeyPair();

    // Create a transaction with a valid nonce
    const validTx = new Transaction({
      to: '0x1234567890abcdef',
      value: 100,
      nonce: 0,
    });
    validTx.sign(privateKey);
    expect(validTx.validate(new StateManager())).toBe(true);

    // Create a transaction with an invalid nonce
    const invalidTx = new Transaction({
      to: '0x1234567890abcdef',
      value: 100,
      nonce: 1,
    });
    invalidTx.sign(privateKey);
    expect(invalidTx.validate(new StateManager())).toBe(false);
  });

  it('should check the sender balance', () => {
    // Generate a valid key pair
    const { publicKey, privateKey } = generateKeyPair();

    // Create an account with sufficient balance
    const account = new Account({ balance: 1000 });
    const stateManager = new StateManager();
    stateManager.addAccount('0x1234567890abcdef', account);

    // Create a transaction with sufficient balance
    const sufficientTx = new Transaction({
      to: '0x0987654321fedcba',
      value: 100,
      nonce: 0,
    });
    sufficientTx.sign(privateKey);
    expect(sufficientTx.validate(stateManager)).toBe(true);

    // Create a transaction with insufficient balance
    const insufficientTx = new Transaction({
      to: '0x0987654321fedcba',
      value: 2000,
      nonce: 0,
    });
    insufficientTx.sign(privateKey);
    expect(insufficientTx.validate(stateManager)).toBe(false);
  });
});