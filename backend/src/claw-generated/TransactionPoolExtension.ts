import { Transaction } from '../blockchain/Block';
import { verifyTransactionSignature } from '../blockchain/Crypto';
import { TransactionPool, ValidationResult } from '../blockchain/TransactionPool';

export class TransactionPoolExtension extends TransactionPool {
  async addTransaction(tx: Transaction): Promise<ValidationResult> {
    // Validate transaction
    const validation = await this.validateTransaction(tx);
    if (!validation.valid) {
      console.log(`[POOL] Transaction rejected: ${validation.error}`);
      return validation;
    }

    // Verify signature
    if (!await this.verifyTransactionSignature(tx)) {
      return { valid: false, error: 'Invalid signature' };
    }

    return super.addTransaction(tx);
  }

  private async verifyTransactionSignature(tx: Transaction): Promise<boolean> {
    try {
      return verifyTransactionSignature(tx);
    } catch (error) {
      console.error('[POOL] Signature verification failed:', error);
      return false;
    }
  }
}