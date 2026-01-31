import { Transaction, ValidationResult } from './transaction';
import { StateManager } from './StateManager';

export class TransactionProcessor {
  private stateManager: StateManager;
  private nonces: Map<string, number> = new Map();

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
  }

  async validateTransaction(tx: Transaction): Promise<ValidationResult> {
    // Check nonce
    const expectedNonce = await this.getNonce(tx.from);
    if (tx.nonce < expectedNonce) {
      return { valid: false, error: `Nonce too low: expected ${expectedNonce}, got ${tx.nonce}` };
    }

    // Allow slightly higher nonce for queued transactions
    if (tx.nonce > expectedNonce + 10) {
      return { valid: false, error: `Nonce too high: expected ${expectedNonce}, got ${tx.nonce}` };
    }

    // Other validation checks...

    return { valid: true };
  }

  async addTransaction(tx: Transaction): Promise<ValidationResult> {
    const validation = await this.validateTransaction(tx);
    if (!validation.valid) {
      return validation;
    }

    // Update nonce
    await this.incrementNonce(tx.from);

    // Process transaction...

    return { valid: true };
  }

  private async getNonce(address: string): Promise<number> {
    if (this.nonces.has(address)) {
      return this.nonces.get(address)!;
    }

    const nonce = await this.stateManager.getNonce(address);
    this.nonces.set(address, nonce);
    return nonce;
  }

  private async incrementNonce(address: string): Promise<void> {
    const currentNonce = await this.getNonce(address);
    this.nonces.set(address, currentNonce + 1);
  }
}