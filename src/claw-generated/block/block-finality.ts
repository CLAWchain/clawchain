import { Block } from './block';

class BlockFinality {
  private finalizedBlocks: Block[] = [];
  private pendingBlocks: Block[] = [];
  private confirmationsRequired: number = 6;

  constructor(confirmationsRequired: number = 6) {
    this.confirmationsRequired = confirmationsRequired;
  }

  addBlock(block: Block): void {
    if (this.finalizedBlocks.length >= this.confirmationsRequired) {
      this.finalizedBlocks.shift();
    }
    this.finalizedBlocks.push(block);
    this.pendingBlocks = this.pendingBlocks.filter((b) => b.hash !== block.hash);
  }

  addPendingBlock(block: Block): void {
    this.pendingBlocks.push(block);
  }

  getFinalizedBlocks(): Block[] {
    return this.finalizedBlocks;
  }

  getPendingBlocks(): Block[] {
    return this.pendingBlocks;
  }

  isBlockFinalized(block: Block): boolean {
    return this.finalizedBlocks.some((b) => b.hash === block.hash);
  }

  getFinalizationStatus(block: Block): 'finalized' | 'pending' {
    if (this.isBlockFinalized(block)) {
      return 'finalized';
    } else if (this.pendingBlocks.some((b) => b.hash === block.hash)) {
      return 'pending';
    } else {
      return 'unknown';
    }
  }
}

export { BlockFinality };