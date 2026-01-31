import { Keypair } from '../wallet/keypair';
import * as ed25519 from 'ed25519-supercop';

export class Transaction {
  id: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  fee: number;
  timestamp: number;
  signature: string;

  constructor(
    fromAddress: string,
    toAddress: string,
    amount: number,
    fee: number,
    timestamp: number,
    signature: string
  ) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.fee = fee;
    this.timestamp = timestamp;
    this.signature = signature;
    this.id = this.generateId();
  }

  generateId(): string {
    // Implement transaction ID generation
    return 'PLACEHOLDER_ID';
  }

  verify(publicKey: string): boolean {
    try {
      const signature = Buffer.from(this.signature, 'hex');
      const message = this.getMessageBytes();
      const publicKeyBuffer = Buffer.from(publicKey, 'hex');

      return ed25519.verify(signature, message, publicKeyBuffer);
    } catch (err) {
      console.error('Error verifying transaction signature:', err);
      return false;
    }
  }

  private getMessageBytes(): Buffer {
    const { fromAddress, toAddress, amount, fee, timestamp } = this;
    const message = `${fromAddress}:${toAddress}:${amount}:${fee}:${timestamp}`;
    return Buffer.from(message);
  }
}