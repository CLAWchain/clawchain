import { Block } from '../blockchain/block';
import { TransactionPool } from '../blockchain/transaction-pool';

export class BlockFinality {
  private finalizedBlocks: Block[] = [];
  private pendingBlocks: Block[] = [];
  private requiredConfirmations: number = 6;

  addBlock(block: Block) {
    // Check if block is valid
    // If valid, add to pending blocks
    this.pendingBlocks.push(block);
    this.checkFinality();
  }

  private checkFinality() {
    // Iterate through pending blocks
    // Check if any have the required confirmations
    // Move to finalized blocks
    // Remove from pending
    for (let i = 0; i < this.pendingBlocks.length; i++) {
      const block = this.pendingBlocks[i];
      if (block.confirmations >= this.requiredConfirmations) {
        this.finalizedBlocks.push(block);
        this.pendingBlocks.splice(i, 1);
        i--; // Decrement index to account for removed block
      }
    }
  }

  getFinalizedBlocks(): Block[] {
    return this.finalizedBlocks;
  }

  getPendingBlocks(): Block[] {
    return this.pendingBlocks;
  }

  getFinalizationStatus(blockHash: string): 'finalized' | 'pending' {
    // Check if block is in finalized or pending lists
    // Return appropriate status
    for (const block of this.finalizedBlocks) {
      if (block.hash === blockHash) {
        return 'finalized';
      }
    }
    for (const block of this.pendingBlocks) {
      if (block.hash === blockHash) {
        return 'pending';
      }
    }
    return 'pending'; // Default to pending if not found
  }
}