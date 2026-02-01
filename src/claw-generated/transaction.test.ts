import { Transaction } from './transaction';
import { Account } from '../account/account';
import { expect } from 'chai';

describe('Transaction', () => {
  describe('validate()', () => {
    it('should verify the transaction signature', () => {
      const account = new Account('0x1234567890abcdef');
      const transaction = new Transaction(
        account,
        new Account('0x0987654321fedcba'),
        100,
        1,
        '0xdeadbeef'
      );

      expect(transaction.validate()).to.be.true;
    });

    it('should validate the nonce', () => {
      const account = new Account('0x1234567890abcdef', 5);
      const transaction = new Transaction(
        account,
        new Account('0x0987654321fedcba'),
        100,
        6,
        '0xdeadbeef'
      );

      expect(transaction.validate()).to.be.true;

      const invalidTransaction = new Transaction(
        account,
        new Account('0x0987654321fedcba'),
        100,
        4,
        '0xdeadbeef'
      );

      expect(invalidTransaction.validate()).to.be.false;
    });

    it('should validate the sender balance', () => {
      const account = new Account('0x1234567890abcdef', 100);
      const transaction = new Transaction(
        account,
        new Account('0x0987654321fedcba'),
        50,
        1,
        '0xdeadbeef'
      );

      expect(transaction.validate()).to.be.true;

      const invalidTransaction = new Transaction(
        account,
        new Account('0x0987654321fedcba'),
        200,
        2,
        '0xdeadbeef'
      );

      expect(invalidTransaction.validate()).to.be.false;
    });
  });
})