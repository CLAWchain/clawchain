import { TransactionPool, ValidationResult } from '../blockchain/TransactionPool';
import { verifyTransactionSignature } from '../blockchain/Crypto';

export class TransactionPoolExtension extends TransactionPool {
  async addTransaction(tx: Transaction): Promise<ValidationResult> {
    // Validate transaction
    const validation = await super.validateTransaction(tx);
    if (!validation.valid) {
      console.log(`[POOL] Transaction rejected: ${validation.error}`);
      return validation;
    }

    // Verify signature
    if (!this.verifyTransactionSignature(tx)) {
      return { valid: false, error: 'Invalid transaction signature' };
    }

    this.pendingTransactions.set(tx.hash, tx);
    this.knownHashes.add(tx.hash);

    try {
      // ... existing code ...
    } catch (error) {
      console.error('[POOL] Database error:', error);
    }

    console.log(`[POOL] Transaction ${tx.hash.substring(0, 16)}... added (${stateManager.formatBalance(tx.value)})`);

    // Emit event
    eventBus.emit('transaction_added', {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value.toString()
    });

    return { valid: true };
  }

  private verifyTransactionSignature(tx: Transaction): boolean {
    try {
      return verifyTransactionSignature(tx);
    } catch (error) {
      console.error('[POOL] Transaction signature verification failed:', error);
      return false;
    }
  }
}