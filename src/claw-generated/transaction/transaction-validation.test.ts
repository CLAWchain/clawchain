import { TransactionValidator } from './transaction-validation';
import { Transaction } from './transaction';
import { Account } from '../account/account';

describe('TransactionValidator', () => {
  let transaction: Transaction;
  let account: Account;

  beforeEach(() => {
    // Set up test data
    transaction = new Transaction({
      nonce: 1,
      from: '0x123456789abcdef',
      to: '0xfedcba9876543210',
      value: 100,
      gas: 21000,
      gasPrice: 10,
      data: '0x',
      signature: '0x...'
    });

    account = new Account({
      address: '0x123456789abcdef',
      balance: 1000,
      nonce: 0
    });
  });

  describe('validateTransaction', () => {
    it('should return true for a valid transaction', () => {
      expect(TransactionValidator.validateTransaction(transaction, account)).toBe(true);
    });

    it('should return false for an invalid signature', () => {
      transaction.signature = '0xInvalidSignature';
      expect(TransactionValidator.validateTransaction(transaction, account)).toBe(false);
    });

    it('should return false for an invalid nonce', () => {
      transaction.nonce = 0;
      expect(TransactionValidator.validateTransaction(transaction, account)).toBe(false);
    });

    // Add more test cases for other validation checks
  });

  describe('verifyTransactionSignature', () => {
    // Add test cases for signature verification
  });

  describe('verifyTransactionNonce', () => {
    it('should return true for a valid nonce', () => {
      expect(TransactionValidator.verifyTransactionNonce(transaction, account)).toBe(true);
    });

    it('should return false for a nonce that is too low', () => {
      transaction.nonce = 0;
      expect(TransactionValidator.verifyTransactionNonce(transaction, account)).toBe(false);
    });

    it('should return false for a nonce that is too high', () => {
      transaction.nonce = TransactionValidator.MAX_NONCE + 1;
      expect(TransactionValidator.verifyTransactionNonce(transaction, account)).toBe(false);
    });
  });
});