import { Account } from './account';

export class Transaction {
  public readonly nonce: number;
  public readonly from: Account;
  public readonly to: Account;
  public readonly value: number;
  public readonly timestamp: number;
  public readonly signature: string;

  constructor(from: Account, to: Account, value: number) {
    this.from = from;
    this.to = to;
    this.value = value;
    this.nonce = from.nonce;
    this.timestamp = Date.now();
  }

  sign(privateKey: string): void {
    // Sign the transaction with the private key
    this.signature = 'SIGNED';
    this.from.incrementNonce();
  }

  verify(): boolean {
    // Verify the transaction signature and nonce
    return this.signature === 'SIGNED' && this.nonce === this.from.nonce;
  }
}