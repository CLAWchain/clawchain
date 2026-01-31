import * as ed25519 from 'ed25519-verify';

export class Transaction {
  id: string;
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  signature: string;

  constructor(
    id: string,
    inputs: TransactionInput[],
    outputs: TransactionOutput[],
    signature: string
  ) {
    this.id = id;
    this.inputs = inputs;
    this.outputs = outputs;
    this.signature = signature;
  }

  validate(): boolean {
    // Validate transaction structure and balances
    return this.verifySignature();
  }

  verifySignature(): boolean {
    // TODO: Implement Ed25519 signature verification
    return true;
  }
}

export interface TransactionInput {
  prevTxId: string;
  outputIndex: number;
  amount: number;
}

export interface TransactionOutput {
  address: string;
  amount: number;
}