import { Block, Transaction } from './types';

export class TransactionFeeCalculator {
  calculateFee(tx: Transaction): number {
    // Calculate fee based on transaction size and complexity
    const baseFee = 0.001;
    const sizeMultiplier = tx.size / 1000; // $0.001 per kB
    const complexityMultiplier = tx.inputCount + tx.outputCount + (tx.contractExecution ? 1 : 0);
    return baseFee * (1 + sizeMultiplier + complexityMultiplier);
  }

  addFeesToBlock(block: Block): Block {
    let totalFees = 0;
    block.transactions.forEach(tx => {
      const fee = this.calculateFee(tx);
      tx.fee = fee;
      totalFees += fee;
    });

    block.reward += totalFees;
    return block;
  }
}