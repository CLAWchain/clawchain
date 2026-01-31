import { Block } from './Block';

export class BlockchainManager {
  private currentBlockHeight: number = 0;
  private finalizedBlocks: Block[] = [];
  private pendingBlocks: Block[] = [];
  private requiredConfirmations: number = 6;

  addBlock(block: Block): void {
    this.pendingBlocks.push(block);
    this.checkFinality();
  }

  private checkFinality(): void {
    this.pendingBlocks.forEach((block, index) => {
      if (this.currentBlockHeight - block.blockNumber >= this.requiredConfirmations) {
        block.finalized = true;
        this.finalizedBlocks.push(block);
        this.pendingBlocks.splice(index, 1);
      }
    });
    this.currentBlockHeight++;
  }

  getBlockFinality(blockNumber: number): { status: 'pending' | 'finalized' | 'orphaned' } {
    const block = this.finalizedBlocks.find(b => b.blockNumber === blockNumber);
    if (block) {
      return { status: 'finalized' };
    }
    const pendingBlock = this.pendingBlocks.find(b => b.blockNumber === blockNumber);
    if (pendingBlock) {
      return { status: 'pending' };
    }
    return { status: 'orphaned' };
  }
}