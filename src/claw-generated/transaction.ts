import { Wallet, SignedTransaction } from './wallet';

export class Transaction {
  private readonly inputs: TransactionInput[];
  private readonly outputs: TransactionOutput[];
  private readonly fee: number;

  constructor(inputs: TransactionInput[], outputs: TransactionOutput[], fee: number) {
    this.inputs = inputs;
    this.outputs = outputs;
    this.fee = fee;
  }

  serialize(): Uint8Array {
    // Serialize the transaction data into a Uint8Array
    // Include the inputs, outputs, and fee
    return new Uint8Array();
  }

  static deserialize(data: Uint8Array): Transaction {
    // Deserialize the Uint8Array into a Transaction object
    // Extract the inputs, outputs, and fee
    return new Transaction([], [], 0);
  }
}

export interface TransactionInput {
  // Define the structure of a transaction input
}

export interface TransactionOutput {
  // Define the structure of a transaction output
}