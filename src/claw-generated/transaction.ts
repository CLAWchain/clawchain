import { Block } from '../block/block';
import { TransactionInput, TransactionOutput } from './transaction-io';

export class Transaction {
  id: string;
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  fee: number;

  constructor(inputs: TransactionInput[], outputs: TransactionOutput[], fee: number) {
    this.inputs = inputs;
    this.outputs = outputs;
    this.fee = fee;
  }

  calculateSize(): number {
    // Calculate the size of the transaction based on the input and output data
    let size = 0;
    size += this.inputs.reduce((total, input) => total + input.size, 0);
    size += this.outputs.reduce((total, output) => total + output.size, 0);
    return size;
  }

  calculateComplexity(): number {
    // Calculate the complexity of the transaction based on the number of inputs and outputs
    return this.inputs.length + this.outputs.length;
  }

  calculateFee(): number {
    // Calculate the transaction fee based on size and complexity
    const size = this.calculateSize();
    const complexity = this.calculateComplexity();
    const baseFee = 0.00001; // 0.01 CLAW per byte
    const complexityFee = 0.0001; // 0.1 CLAW per unit of complexity
    return baseFee * size + complexityFee * complexity;
  }

  addToBlock(block: Block): void {
    // Add the transaction to the block
    block.transactions.push(this);
  }
}