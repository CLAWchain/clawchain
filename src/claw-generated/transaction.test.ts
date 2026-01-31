import { Account } from './account';
import { Transaction } from './transaction';

describe('Transaction', () => {
  it('should increment nonce on sign', () => {
    const from = new Account('from', 100);
    const to = new Account('to', 50);
    const tx = new Transaction(from, to, 10);
    const initialNonce = from.nonce;

    tx.sign('privateKey');

    expect(from.nonce).toEqual(initialNonce + 1);
  });

  it('should verify transaction with correct nonce', () => {
    const from = new Account('from', 100);
    const to = new Account('to', 50);
    const tx = new Transaction(from, to, 10);
    tx.sign('privateKey');

    expect(tx.verify()).toEqual(true);
  });

  it('should reject transaction with incorrect nonce', () => {
    const from = new Account('from', 100);
    const to = new Account('to', 50);
    const tx = new Transaction(from, to, 10);
    tx.nonce = 123; // Set an incorrect nonce
    tx.sign('privateKey');

    expect(tx.verify()).toEqual(false);
  });
});