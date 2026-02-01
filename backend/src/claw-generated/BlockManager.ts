import { Block } from './Block';

export class BlockManager {
  private headBlock: Block;
  private finalizedBlocks: Block[] = [];
  private pendingBlocks: Block[] = [];
  private readonly requiredConfirmations: number = 6;

  addBlock(block: Block) {
    // Validate the block
    // Update head block if necessary

    // Check if the block has enough confirmations to be finalized
    if (this.getConfirmations(block) >= this.requiredConfirmations) {
      this.finalizedBlocks.push(block);
    } else {
      this.pendingBlocks.push(block);
    }
  }

  getFinalizedBlocks(): Block[] {
    return this.finalizedBlocks;
  }

  getPendingBlocks(): Block[] {
    return this.pendingBlocks;
  }

  getFinalizationStatus(blockHash: string): { finalized: boolean, confirmations: number } {
    const block = this.finalizedBlocks.find(b => b.hash === blockHash) || 
                  this.pendingBlocks.find(b => b.hash === blockHash);
    if (!block) {
      return { finalized: false, confirmations: 0 };
    }
    return { 
      finalized: this.finalizedBlocks.includes(block), 
      confirmations: this.getConfirmations(block)
    };
  }

  private getConfirmations(block: Block): number {
    // Calculate the number of confirmations for the given block
    // based on the current head block
    if (!this.headBlock) {
      return 0;
    }
    let confirmations = 0;
    let currentBlock: Block | null = block;
    while (currentBlock && currentBlock.hash !== this.headBlock.hash) {
      confirmations++;
      currentBlock = currentBlock.previousBlock;
    }
    return confirmations;
  }
}