import { Transaction, TransactionManager } from './transaction';
import { TransactionValidator } from './transaction-validation';
import { Account } from '../account/account';

describe('TransactionValidator', () => {
  let account: Account;
  let transaction: Transaction;

  beforeEach(() => {
    account = {
      address: '0x1234567890abcdef',
      privateKey: '0xdeadbeefcafebabedeadbeefcafebabe',
      nextExpectedNonce: 0
    };

    transaction = TransactionManager.createTransaction(
      account,
      { address: '0x0987654321fedcba', privateKey: '0xbabecafebabecafebabecafebabecafe' },
      100,
      0
    );
    transaction = TransactionManager.signTransaction(transaction, account.privateKey);
  });

  test('checkIntegerOverflow', () => {
    expect(TransactionValidator.checkIntegerOverflow(transaction)).toBe(true);

    transaction.amount = Number.MAX_SAFE_INTEGER + 1;
    expect(TransactionValidator.checkIntegerOverflow(transaction)).toBe(false);
  });

  test('checkReplayAttack', () => {
    expect(TransactionValidator.checkReplayAttack(transaction, account)).toBe(true);

    transaction.nonce = 1;
    expect(TransactionValidator.checkReplayAttack(transaction, account)).toBe(false);
  });

  test('checkSignatureMalleability', () => {
    expect(TransactionValidator.checkSignatureMalleability(transaction)).toBe(true);

    // TODO: Implement tests for signature malleability
  });

  test('validateTransaction', () => {
    expect(TransactionValidator.validateTransaction(transaction, account)).toBe(true);

    transaction.amount = Number.MAX_SAFE_INTEGER + 1;
    expect(TransactionValidator.validateTransaction(transaction, account)).toBe(false);

    transaction.amount = 100;
    transaction.nonce = 1;
    expect(TransactionValidator.validateTransaction(transaction, account)).toBe(false);
  });
});