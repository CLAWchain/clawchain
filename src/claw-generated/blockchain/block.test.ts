import { Block } from './block';
import { Transaction } from '../transactions';

describe('Block', () => {
  describe('constructor', () => {
    it('should initialize the transactions property', () => {
      const transactions = [
        new Transaction({
          from: '0x123',
          to: '0x456',
          amount: 100,
          signature: 'abc123',
        }),
      ];
      const block = new Block(transactions);
      expect(block.transactions).toEqual(transactions);
    });
  });

  describe('validateTransactions', () => {
    it('should return true for valid transactions', () => {
      const transactions = [
        new Transaction({
          from: '0x123',
          to: '0x456',
          amount: 100,
          signature: 'abc123',
        }),
      ];
      const block = new Block(transactions);
      expect(block.validateTransactions()).toBe(true);
    });

    it('should return false for invalid transactions', () => {
      const transactions = [
        new Transaction({
          from: '0x123',
          to: '0x456',
          amount: 100,
          signature: 'invalid',
        }),
      ];
      const block = new Block(transactions);
      expect(block.validateTransactions()).toBe(false);
    });
  });
});