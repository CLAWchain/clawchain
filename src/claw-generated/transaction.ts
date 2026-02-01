import { KeyPair } from './keypair';
import { Hash } from '../crypto/hash';

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
    this.signature = keypair.sign(message);
  }

  public verify(publicKey: string): boolean {
    const message = this.toMessage();
    return new KeyPair({ publicKey }).verify(message, this.signature);
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