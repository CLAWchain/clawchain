import { WalletKeypair } from '../wallet/keypair';

export class AccountState {
  readonly address: Uint8Array;
  nonce: number;

  constructor(address: Uint8Array, nonce: number) {
    this.address = address;
    this.nonce = nonce;
  }
}

export class Transaction {
  readonly from: Uint8Array;
  readonly to: Uint8Array;
  readonly amount: number;
  readonly nonce: number;
  readonly signature: Uint8Array;

  constructor(from: Uint8Array, to: Uint8Array, amount: number, nonce: number) {
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.nonce = nonce;
    this.signature = new Uint8Array(0);
  }

  serialize(): Uint8Array {
    // Serialize transaction data
    const data = new Uint8Array([
      ...this.from,
      ...this.to,
      this.amount,
      this.nonce
    ]);
    return data;
  }

  sign(keypair: WalletKeypair): void {
    // Sign the serialized transaction data
    this.signature = keypair.sign(this.serialize());
  }

  verifyNonce(accountState: AccountState): boolean {
    return this.nonce === accountState.nonce + 1;
  }
}