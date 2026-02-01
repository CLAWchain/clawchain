import { Transaction } from './index';
import { Wallet } from '../wallet';
import * as sodium from 'libsodium-wrappers';

describe('Transaction', () => {
  beforeAll(async () => {
    await sodium.ready;
  });

  it('should sign and verify a transaction', () => {
    const wallet = new Wallet();
    const transaction = new Transaction(wallet.getPublicKey(), new Uint8Array([1, 2, 3]), 100);
    transaction.sign(wallet);
    expect(transaction.verify(wallet)).toBe(true);
  });
});