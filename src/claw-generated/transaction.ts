import { KeyPair } from './keypair';
import { Hash } from '../crypto/hash';
import * as ed25519 from 'ed25519-hd-key';

export class Transaction {
  public inputs: TransactionInput[];
  public outputs: TransactionOutput[];
  public timestamp: number;
  public signature: string;

  constructor(inputs: TransactionInput[], outputs: TransactionOutput[], timestamp: number) {
    this.inputs = inputs;
    this.outputs = outputs;
    this.timestamp = timestamp;
  }

  public sign(keypair: KeyPair): void {
    const message = this.toMessage();
    const signature = ed25519.sign(Buffer.from(message), keypair.privateKey);
    this.signature = Buffer.from(signature).toString('hex');
  }

  public verify(publicKey: string): boolean {
    const message = this.toMessage();
    const signature = Buffer.from(this.signature, 'hex');
    return ed25519.verify(Buffer.from(message), signature, Buffer.from(publicKey, 'hex'));
  }

  private toMessage(): string {
    return JSON.stringify({
      inputs: this.inputs,
      outputs: this.outputs,
      timestamp: this.timestamp
    });
  }
}

export interface TransactionInput {
  prevTxHash: Hash;
  outputIndex: number;
  unlockingScript: string;
}

export interface TransactionOutput {
  value: number;
  lockingScript: string;
}