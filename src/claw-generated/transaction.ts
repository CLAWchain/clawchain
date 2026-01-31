import { Buffer } from 'buffer';
import { Account } from './state';
import { TransactionNonce } from './transaction-nonce';

export class Transaction {
  private _inputs: TransactionInput[];
  private _outputs: TransactionOutput[];
  private _timestamp: number;
  private _nonce: number;

  constructor(
    inputs: TransactionInput[],
    outputs: TransactionOutput[],
    timestamp: number,
    nonce: number
  ) {
    this._inputs = inputs;
    this._outputs = outputs;
    this._timestamp = timestamp;
    this._nonce = nonce;
  }

  get nonce(): number {
    return this._nonce;
  }

  serialize(): Buffer {
    const inputsBuffer = this._inputs.map(input => input.serialize());
    const outputsBuffer = this._outputs.map(output => output.serialize());
    const timestampBuffer = Buffer.alloc(8);
    timestampBuffer.writeUInt32BE(this._timestamp, 0);
    const nonceBuffer = Buffer.alloc(4);
    nonceBuffer.writeUInt32BE(this._nonce, 0);

    return Buffer.concat([
      Buffer.from(inputsBuffer.length.toString()),
      ...inputsBuffer,
      Buffer.from(outputsBuffer.length.toString()),
      ...outputsBuffer,
      timestampBuffer,
      nonceBuffer
    ]);
  }
}

export interface TransactionInput {
  prevOutput: TransactionOutput;
  unlockScript: Buffer;
  serialize(): Buffer;
}

export interface TransactionOutput {
  value: number;
  lockScript: Buffer;
  serialize(): Buffer;
}