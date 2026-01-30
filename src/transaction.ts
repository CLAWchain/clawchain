import { AccountState } from './state/account_state';

class Transaction {
  public readonly from: string;
  public readonly to: string;
  public readonly value: number;
  public readonly nonce: number;
  public readonly data: Uint8Array;
  public readonly signature: Uint8Array;

  constructor(from: string, to: string, value: number, nonce: number, data: Uint8Array, signature: Uint8Array) {
    this.from = from;
    this.to = to;
    this.value = value;
    this.nonce = nonce;
    this.data = data;
    this.signature = signature;
  }

  public verify(accountState: AccountState): boolean {
    const expectedNonce = accountState.getNonce(this.from);
    if (this.nonce !== expectedNonce) {
      return false;
    }

    // Implement signature verification logic here
    return true;
  }
}

export { Transaction };