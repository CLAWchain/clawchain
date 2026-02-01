import { StateManager } from '../src/state/StateManager';
import { Account, Transaction } from '../src/types';
import { createKeyPair, signTransaction } from '../src/crypto';

describe('StateManager', () => {
  let stateManager: StateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  it('should update balances correctly', () => {
    // Balance update test
  });

  it('should calculate state root correctly', () => {
    // State root calculation test
  });

  it('should apply transactions correctly', () => {
    // Create some accounts
    const [account1, account2, account3] = [createKeyPair(), createKeyPair(), createKeyPair()];
    stateManager.updateBalance(account1.publicKey, 100);
    stateManager.updateBalance(account2.publicKey, 50);
    stateManager.updateBalance(account3.publicKey, 75);

    // Create valid and invalid transactions
    const validTx = new Transaction({
      from: account1.publicKey,
      to: account2.publicKey,
      amount: 25,
      nonce: 0,
    });
    signTransaction(validTx, account1.privateKey);

    const invalidTx = new Transaction({
      from: account2.publicKey,
      to: account3.publicKey,
      amount: 100,
      nonce: 0,
    });
    signTransaction(invalidTx, account2.privateKey);

    // Apply transactions and verify state
    stateManager.applyTransaction(validTx);
    expect(stateManager.getBalance(account1.publicKey)).toEqual(75);
    expect(stateManager.getBalance(account2.publicKey)).toEqual(75);

    expect(() => stateManager.applyTransaction(invalidTx)).toThrow();
    expect(stateManager.getBalance(account2.publicKey)).toEqual(50);
    expect(stateManager.getBalance(account3.publicKey)).toEqual(75);
  });
});