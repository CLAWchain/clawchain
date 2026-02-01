import { Transaction, TransactionPool, ValidationResult } from '../blockchain/TransactionPool';
import { verifyTransactionSignature } from '../blockchain/Crypto';

export class TransactionPoolExtension extends TransactionPool {
  async addTransaction(tx: Transaction): Promise<ValidationResult> {
    // Validate transaction signature
    const signatureValid = verifyTransactionSignature(tx);
    if (!signatureValid) {
      return { valid: false, error: 'Invalid transaction signature' };
    }

    // Call the original addTransaction method
    return super.addTransaction(tx);
  }
}