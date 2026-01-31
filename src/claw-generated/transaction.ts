import { Ed25519Signature, verifyEd25519Signature } from './ed25519';

export class Transaction {
  public readonly id: string;
  public readonly from: string;
  public readonly to: string;
  public readonly amount: number;
  public readonly timestamp: number;
  public readonly signature: Ed25519Signature;

  constructor(
    id: string,
    from: string,
    to: string,
    amount: number,
    timestamp: number,
    signature: Ed25519Signature
  ) {
    this.id = id;
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.timestamp = timestamp;
    this.signature = signature;
  }

  public verifySignature(): boolean {
    const message = new Uint8Array([
      ...this.from.split('').map(c => c.charCodeAt(0)),
      ...this.to.split('').map(c => c.charCodeAt(0)),
      ...new Uint8Array(new DataView(new ArrayBuffer(8)).buffer).map(b => b),
      ...new Uint8Array(new DataView(new ArrayBuffer(8)).buffer).map(b => b),
    ]);
    return verifyEd25519Signature(message, this.signature);
  }
}