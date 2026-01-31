import { Transaction } from '../models/transaction';
import { Wallet } from '../wallet/wallet';
import { TransactionSigner } from './signing';

describe('TransactionSigner', () => {
  it('should sign and verify a transaction', () => {
    const wallet = new Wallet();
    const tx = new Transaction({
      from: wallet.address,
      to: '0x1234567890abcdef',
      value: 100,
      nonce: 0
    });

    const signedTx = TransactionSigner.sign(tx, wallet);
    expect(signedTx.signature).not.toBeUndefined();

    const isValid = TransactionSigner.verify(signedTx);
    expect(isValid).toBe(true);
  });
});