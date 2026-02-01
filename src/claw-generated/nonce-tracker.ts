import { Transaction } from './transaction';

export class NonceTracker {
  private nonces: Map<string, number> = new Map();

  addTransaction(tx: Transaction): boolean {
    const { sender, nonce } = tx;
    const lastNonce = this.nonces.get(sender) || 0;

    if (nonce <= lastNonce) {
      return false; // Nonce is not greater than the last one
    }

    this.nonces.set(sender, nonce);
    return true;
  }

  resetNonce(address: string): void {
    this.nonces.delete(address);
  }
}