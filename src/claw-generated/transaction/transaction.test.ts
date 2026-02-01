import { Transaction } from './index';
import { Wallet } from '../wallet';
import * as sodium from 'libsodium-wrappers';

describe('Transaction', () => {
  beforeAll(async () => {
    await sodium.ready;
  });

  it('should sign and verify a transaction', () => {
    const wallet = new Wallet();
    const transaction = new Transaction(wallet.getPublicKey(), new Uint8Array([1, 2, 3]), 100, 1);
    transaction.sign(wallet);
    expect(transaction.verify(wallet, 0)).toBe(true);
  });

  it('should detect replay attacks', () => {
    const wallet = new Wallet();
    const transaction = new Transaction(wallet.getPublicKey(), new Uint8Array([1, 2, 3]), 100, 1);
    transaction.sign(wallet);
    expect(transaction.verify(wallet, 1)).toBe(false);
  });

  it('should detect integer overflows', () => {
    const wallet = new Wallet();
    const transaction = new Transaction(wallet.getPublicKey(), new Uint8Array([1, 2, 3]), Number.MAX_SAFE_INTEGER, 1);
    transaction.sign(wallet);
    expect(transaction.verify(wallet, 0)).toBe(false);
  });
});