import { Block } from './block';
import { Transaction } from './transaction';
import { TransactionPool } from './transaction-pool';
import { BlockFinality } from './block-finality';

export class Blockchain {
  private blocks: Block[] = [];
  private transactionPool: TransactionPool = new TransactionPool();
  private blockFinality: BlockFinality = new BlockFinality();

  addBlock(block: Block) {
    // Validate block
    // Add block to chain
    this.blocks.push(block);
    this.blockFinality.addBlock(block);
  }

  addTransaction(transaction: Transaction) {
    // Validate transaction
    // Add to transaction pool
    this.transactionPool.addTransaction(transaction);
  }

  getBlocks(): Block[] {
    return this.blocks;
  }

  getTransactionPool(): Transaction[] {
    return this.transactionPool.getTransactions();
  }

  getFinalizedBlocks(): Block[] {
    return this.blockFinality.getFinalizedBlocks();
  }

  getPendingBlocks(): Block[] {
    return this.blockFinality.getPendingBlocks();
  }

  getFinalizationStatus(blockHash: string): 'finalized' | 'pending' {
    return this.blockFinality.getFinalizationStatus(blockHash);
  }
}