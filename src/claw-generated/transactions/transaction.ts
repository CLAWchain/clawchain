import { Wallet } from '../crypto/wallet';

export interface Transaction {
  id: string;
  sender: string;
  recipient: string;
  amount: number;
  signature: string;
}

export class TransactionValidator {
  static verifySignature(transaction: Transaction, wallet: Wallet): boolean {
    const { sender, recipient, amount } = transaction;
    const transactionData = `${sender}:${recipient}:${amount}`;
    const publicKey = wallet.publicKey;

    try {
      return ed25519.verify(
        Buffer.from(transaction.signature, 'base64'),
        Buffer.from(transactionData),
        Buffer.from(publicKey, 'base64')
      );
    } catch (error) {
      console.error('Error verifying transaction signature:', error);
      return false;
    }
  }
}