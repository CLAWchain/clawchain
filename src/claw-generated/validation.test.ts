import { expect } from 'chai';
import { Transaction } from '../transaction/transaction';
import { validateTransaction } from '../transaction/validation';
import { generatePrivateKey, sign } from '../crypto';
import { StateManager } from '../state';

describe('Transaction Validation', () => {
  // ... existing test cases ...

  it('should validate the sender balance', () => {
    // Generate a private key for the sender
    const senderPrivateKey = generatePrivateKey();

    // Create a transaction with a valid balance
    const validTx = new Transaction({
      from: '0x1234567890123456789012345678901234567890',
      to: '0x0987654321098765432109876543210987654321',
      value: 100,
      nonce: 0
    });
    validTx.sign(senderPrivateKey);

    // Mock the StateManager to provide a valid balance
    const stateManager = new StateManager();
    stateManager.setAccountBalance(validTx.from, 1000);
    stateManager.setAccountNonce(validTx.from, 0);

    // Validate the transaction
    const isValidTxValid = validateTransaction(validTx, stateManager);
    expect(isValidTxValid).to.be.true;
  });

  it('should reject a transaction with insufficient sender balance', () => {
    // Generate a private key for the sender
    const senderPrivateKey = generatePrivateKey();

    // Create a transaction that exceeds the sender's balance
    const invalidTx = new Transaction({
      from: '0x1234567890123456789012345678901234567890',
      to: '0x0987654321098765432109876543210987654321',
      value: 1000, // Exceeds the sender's balance
      nonce: 0
    });
    invalidTx.sign(senderPrivateKey);

    // Mock the StateManager to provide an insufficient balance
    const stateManager = new StateManager();
    stateManager.setAccountBalance(invalidTx.from, 500);
    stateManager.setAccountNonce(invalidTx.from, 0);

    // Validate the transaction
    const isInvalidTxValid = validateTransaction(invalidTx, stateManager);
    expect(isInvalidTxValid).to.be.false;
  });

  // ... other test cases
});