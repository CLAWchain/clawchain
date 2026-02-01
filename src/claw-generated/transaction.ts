import { Wallet } from './wallet';
import { Ed25519Signature, Ed25519KeyPair } from 'crypto';
import { varintEncode, varintDecode } from './utils';

export class Transaction {
  private inputs: TransactionInput[];
  private outputs: TransactionOutput[];
  private signature: Ed25519Signature;
  private nonce: number;

  constructor(inputs: TransactionInput[], outputs: TransactionOutput[], nonce: number) {
    this.inputs = inputs;
    this.outputs = outputs;
    this.nonce = nonce;
  }

  sign(wallet: Wallet): void {
    const transactionData = this.serialize();
    this.signature = wallet.keyPair.sign(transactionData);
  }

  serialize(): Buffer {
    const inputCount = varintEncode(this.inputs.length);
    const inputsBuffer = Buffer.concat(this.inputs.map(input => {
      const prevTxHash = input.previousTxHash;
      const outputIndex = Buffer.alloc(4);
      outputIndex.writeUInt32BE(input.outputIndex);
      return Buffer.concat([prevTxHash, outputIndex]);
    }));

    const outputCount = varintEncode(this.outputs.length);
    const outputsBuffer = Buffer.concat(this.outputs.map(output => {
      const amountBuffer = Buffer.alloc(8);
      amountBuffer.writeBigUInt64BE(BigInt(output.amount));
      return Buffer.concat([amountBuffer, output.recipient]);
    }));

    const nonceBuffer = Buffer.alloc(4);
    nonceBuffer.writeUInt32BE(this.nonce);

    return Buffer.concat([inputCount, inputsBuffer, outputCount, outputsBuffer, nonceBuffer, this.signature]);
  }
}

export interface TransactionInput {
  previousTxHash: Buffer;
  outputIndex: number;
}

export interface TransactionOutput {
  amount: number;
  recipient: Buffer;
}

function varintEncode(value: number): Buffer {
  // Implement varint encoding
}

function varintDecode(buffer: Buffer): [number, number] {
  // Implement varint decoding
}