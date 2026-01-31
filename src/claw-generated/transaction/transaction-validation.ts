import { Transaction } from './transaction';
import { Account } from '../account/account';
import { TransactionSigner, SignedTransaction } from '../transactions/signing';

export class TransactionValidator {
  static checkIntegerOverflow(transaction: Transaction): boolean {
    // Implement logic to check for integer overflow in the transaction amount
    return transaction.amount <= Number.MAX_SAFE_INTEGER;
  }

  static checkReplayAttack(transaction: Transaction, account: Account): boolean {
    // Implement logic to check for replay attacks by tracking transaction nonces
    return transaction.nonce === account.nextExpectedNonce;
  }

  static checkSignature(transaction: Transaction, publicKey: string, signature: SignedTransaction): boolean {
    const signer = new TransactionSigner('eddsa');
    return signer.verify(transaction, publicKey, signature);
  }

  static validateTransaction(transaction: Transaction, account: Account): boolean {
    const { from, signature } = transaction;
    return (
      this.checkIntegerOverflow(transaction) &&
      this.checkReplayAttack(transaction, account) &&
      this.checkSignature(transaction, from, signature)
    );
  }
}