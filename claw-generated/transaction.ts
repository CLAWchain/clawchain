// Transaction module
import { Ed25519Keypair } from './crypto';

export class Transaction {
  constructor(
    public readonly from: Ed25519Keypair,
    public readonly to: Ed25519Keypair,
    public readonly amount: number,
    public readonly timestamp: number,
    public readonly signature: string
  ) {}

  verify(): boolean {
    // TODO: Implement signature verification
    return true;
  }
}