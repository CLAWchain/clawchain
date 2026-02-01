import { Transaction } from '../model/Transaction';
import { PublicKey } from '../crypto/PublicKey';
import { StateManager } from '../state/StateManager';

export class TransactionValidator {
  private stateManager: StateManager;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
  }

  verifySignature(transaction: Transaction): boolean {
    const { from, signature, data } = transaction;
    const publicKey = new PublicKey(from);
    return publicKey.verify(data, signature);
  }

  verifyNonce(transaction: Transaction): boolean {
    const { from, nonce } = transaction;
    const lastNonce = this.stateManager.getLastNonce(from);
    return nonce === lastNonce + 1;
  }

  verifyBalance(transaction: Transaction): boolean {
    // TODO: Implement balance check
    return true;
  }

  validateTransaction(transaction: Transaction): boolean {
    return this.verifySignature(transaction) &&
           this.verifyNonce(transaction) &&
           this.verifyBalance(transaction);
  }
}