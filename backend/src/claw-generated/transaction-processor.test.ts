import { Transaction } from './transaction';
import { Account } from './account';
import { TransactionProcessor } from './transaction-processor';

describe('TransactionProcessor', () => {
  it('should process valid transactions', () => {
    const accounts = [
      new Account('Alice', 100, 0),
      new Account('Bob', 0, 0)
    ];
    const tx1 = new Transaction('Alice', 'Bob', 50, 1);
    const tx2 = new Transaction('Alice', 'Bob', 25, 2);

    const processor = new TransactionProcessor();
    expect(processor.processTransaction(tx1, accounts)).toBe(true);
    expect(processor.processTransaction(tx2, accounts)).toBe(true);

    expect(accounts[0].balance).toBe(50);
    expect(accounts[0].nonce).toBe(2);
    expect(accounts[1].balance).toBe(75);
  });

  it('should reject transactions with invalid nonce', () => {
    const accounts = [
      new Account('Alice', 100, 1),
      new Account('Bob', 0, 0)
    ];
    const tx1 = new Transaction('Alice', 'Bob', 50, 0);
    const tx2 = new Transaction('Alice', 'Bob', 25, 2);

    const processor = new TransactionProcessor();
    expect(processor.processTransaction(tx1, accounts)).toBe(false);
    expect(processor.processTransaction(tx2, accounts)).toBe(false);

    expect(accounts[0].balance).toBe(100);
    expect(accounts[0].nonce).toBe(1);
    expect(accounts[1].balance).toBe(0);
  });
});