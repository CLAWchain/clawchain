import { Account } from './account';

export class NonceTracker {
  private nonces: Map<string, number> = new Map();

  getNonce(account: Account): number {
    const address = account.getAddress();
    return this.nonces.get(address) || 0;
  }

  incrementNonce(account: Account): number {
    const address = account.getAddress();
    const currentNonce = this.getNonce(account);
    this.nonces.set(address, currentNonce + 1);
    return currentNonce + 1;
  }
}