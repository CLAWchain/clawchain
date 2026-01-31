import { Keypair } from '../keypair';
import * as ed25519 from 'ed25519-supercop';

export class Transaction {
  constructor(
    public from: Keypair,
    public to: Keypair,
    public amount: number,
    public signature: string
  ) {}

  verify(): boolean {
    try {
      return ed25519.verify(
        Buffer.from(this.signature, 'hex'),
        Buffer.from(JSON.stringify({
          from: this.from.publicKey,
          to: this.to.publicKey,
          amount: this.amount
        })),
        Buffer.from(this.from.publicKey, 'hex')
      );
    } catch (err) {
      console.error('Error verifying transaction:', err);
      return false;
    }
  }
}