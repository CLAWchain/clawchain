import { AccountState } from './state/account_state';
import { recoverPublicKey, verifySignature } from './crypto';

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

    // Check for integer overflows
    if (this.value < 0 || this.nonce < 0) {
      return false;
    }

    // Check for replay attacks
    if (accountState.hasSeenNonce(this.from, this.nonce)) {
      return false;
    }

    // Verify the signature
    const publicKey = recoverPublicKey(this.data, this.signature);
    if (publicKey !== this.from) {
      return false;
    }

    // Verify the signature is not malleable
    if (!verifySignature(this.data, this.signature, publicKey)) {
      return false;
    }

    return true;
  }
}

export { Transaction };