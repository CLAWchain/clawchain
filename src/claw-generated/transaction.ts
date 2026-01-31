import { Wallet } from './wallet';

export class Transaction {
  from: Uint8Array;
  to: Uint8Array;
  amount: number;
  nonce: number;
  signature: Uint8Array;

  constructor(from: Uint8Array, to: Uint8Array, amount: number, nonce: number) {
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.nonce = nonce;
  }

  serialize(): Uint8Array {
    // Serialize transaction data into a byte array
    return new Uint8Array([
      ...this.from,
      ...this.to,
      this.amount,
      this.nonce
    ]);
  }

  sign(wallet: Wallet): void {
    const serializedTx = this.serialize();
    this.signature = wallet.sign(serializedTx);
  }
}