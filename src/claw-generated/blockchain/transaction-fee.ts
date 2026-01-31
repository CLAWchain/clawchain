import { Block, Transaction } from './types';
import { Config } from '../config';

export class TransactionFeeCalculator {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  calculateFee(tx: Transaction): number {
    const baseFee = this.config.transactionBaseFee;
    const sizeMultiplier = tx.size / 1000 * this.config.transactionSizeMultiplier; // $0.001 per kB
    const complexityMultiplier = (tx.inputCount + tx.outputCount + (tx.contractExecution ? 1 : 0)) * this.config.transactionComplexityMultiplier;
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