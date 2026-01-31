import { Account } from './state';

export class TransactionNonce {
  private _nonces: Map<string, number>;

  constructor() {
    this._nonces = new Map();
  }

  getNonce(account: Account): number {
    const address = account.address.toString();
    if (!this._nonces.has(address)) {
      this._nonces.set(address, 0);
    }
    return this._nonces.get(address)!;
  }

  incrementNonce(account: Account): void {
    const address = account.address.toString();
    const currentNonce = this.getNonce(account);
    this._nonces.set(address, currentNonce + 1);
  }
}