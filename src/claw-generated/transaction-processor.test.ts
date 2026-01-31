import { processTransaction } from './transaction-processor';
import { Transaction } from './transaction';
import { AccountState } from './account-state';

describe('Transaction Processor', () => {
  test('should process a valid transaction', () => {
    const accountStates = new Map<string, AccountState>();
    accountStates.set('alice', { balance: 100, nonce: 0 });
    accountStates.set('bob', { balance: 0, nonce: 0 });

    const transaction: Transaction = {
      from: 'alice',
      to: 'bob',
      amount: 50,
      nonce: 1,
      signature: 'valid-signature'
    };

    expect(processTransaction(transaction, accountStates)).toBe(true);
    expect(accountStates.get('alice')?.balance).toBe(50);
    expect(accountStates.get('alice')?.nonce).toBe(1);
    expect(accountStates.get('bob')?.balance).toBe(50);
  });

  test('should reject a transaction with an invalid nonce', () => {
    const accountStates = new Map<string, AccountState>();
    accountStates.set('alice', { balance: 100, nonce: 1 });
    accountStates.set('bob', { balance: 0, nonce: 0 });

    const transaction: Transaction = {
      from: 'alice',
      to: 'bob',
      amount: 50,
      nonce: 1, // Should be 2 to be valid
      signature: 'valid-signature'
    };

    expect(processTransaction(transaction, accountStates)).toBe(false);
    expect(accountStates.get('alice')?.balance).toBe(100);
    expect(accountStates.get('alice')?.nonce).toBe(1);
    expect(accountStates.get('bob')?.balance).toBe(0);
  });
});