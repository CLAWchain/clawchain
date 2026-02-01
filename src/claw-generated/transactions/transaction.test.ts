import { Wallet } from '../crypto/wallet';
import { Transaction, TransactionValidator } from './transaction';

describe('Transaction', () => {
  it('should sign and verify a transaction', () => {
    const mnemonic = 'abandon amount expire adjust cage candy arch gather drum buyer index expire adjust';
    const wallet = Wallet.generateFromMnemonic(mnemonic);

    const transaction: Transaction = {
      id: '1234',
      sender: wallet.address,
      recipient: 'recipient_address',
      amount: 100,
      signature: '',
    };

    const signedTransaction = TransactionValidator.signTransaction(transaction, wallet);
    expect(signedTransaction.signature).not.toEqual('');

    const isValid = TransactionValidator.verifySignature(signedTransaction, wallet);
    expect(isValid).toBe(true);
  });
});