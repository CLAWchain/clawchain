import { Block } from './block';
import { Transaction } from './transaction';

export class BlockchainManager {
  private chain: Block[] = [];
  private pendingTransactions: Transaction[] = [];
  private maxBlockSize: number = 1000000; // 1 MB
  private blockSizeAdjustmentInterval: number = 10; // Adjust every 10 blocks

  addTransaction(transaction: Transaction): void {
    this.pendingTransactions.push(transaction);
  }

  mineBlock(): Block {
    const newBlock = new Block(
      this.chain.length,
      Date.now(),
      this.pendingTransactions,
      this.chain.length > 0 ? this.chain[this.chain.length - 1].hash : ''
    );

    if (!newBlock.validateSize(this.maxBlockSize)) {
      throw new Error('Block size exceeds maximum limit');
    }

    this.chain.push(newBlock);
    this.pendingTransactions = [];

    if (this.chain.length % this.blockSizeAdjustmentInterval === 0) {
      this.adjustBlockSize();
    }

    return newBlock;
  }

  getChain(): Block[] {
    return this.chain;
  }

  private adjustBlockSize(): void {
    // Calculate the average block size over the last X blocks
    const lastBlocks = this.chain.slice(-this.blockSizeAdjustmentInterval);
    const averageBlockSize = lastBlocks.reduce((sum, block) => sum + block.size, 0) / lastBlocks.length;

    // Adjust the max block size based on the average
    this.maxBlockSize = Math.max(100000, Math.floor(averageBlockSize * 1.2)); // Increase by 20%
  }
}