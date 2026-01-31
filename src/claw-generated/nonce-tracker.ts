import { Transaction } from './transaction';

export class NonceTracker {
  private nonceMap: Map<string, number>;

  constructor() {
    this.nonceMap = new Map();
  }

  trackNonce(transaction: Transaction): boolean {
    const { sender, nonce } = transaction;
    const currentNonce = this.nonceMap.get(sender) || 0;

    if (nonce <= currentNonce) {
      return false; // Nonce is not greater than the last one
    }

    this.nonceMap.set(sender, nonce);
    return true;
  }
}