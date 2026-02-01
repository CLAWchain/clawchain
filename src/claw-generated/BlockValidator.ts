import { Block, MAX_BLOCK_SIZE, MIN_BLOCK_SIZE } from './block';
import { Transaction } from './transaction';
import { Account } from './account';
import { WorkerPool } from './WorkerPool';

export class BlockValidator {
  private workerPool: WorkerPool;

  constructor() {
    this.workerPool = new WorkerPool(4); // Use 4 worker threads/processes
  }

  async validateBlock(block: Block): Promise<boolean> {
    // Validate block size
    if (!this.validateBlockSize(block)) {
      return false;
    }

    // Validate transactions in parallel
    const transactionResults = await this.validateTransactions(block.data);
    if (transactionResults.some((result) => !result)) {
      return false;
    }

    return true;
  }

  private validateBlockSize(block: Block): boolean {
    const blockSize = JSON.stringify(block).length;
    if (blockSize > MAX_BLOCK_SIZE) {
      throw new Error(`Block size (${blockSize} bytes) exceeds maximum of ${MAX_BLOCK_SIZE} bytes`);
    }

    // Adjust block size limit based on network conditions
    if (blockSize > MAX_BLOCK_SIZE * 0.8) {
      MAX_BLOCK_SIZE = Math.max(MAX_BLOCK_SIZE * 1.1, MIN_BLOCK_SIZE);
    } else if (blockSize < MAX_BLOCK_SIZE * 0.5) {
      MAX_BLOCK_SIZE = Math.max(MAX_BLOCK_SIZE * 0.9, MIN_BLOCK_SIZE);
    }

    return true;
  }

  private async validateTransactions(transactions: Transaction[]): Promise<boolean[]> {
    const validationResults = await Promise.all(
      transactions.map((tx) => this.workerPool.validateTransaction(tx))
    );
    return validationResults;
  }
}