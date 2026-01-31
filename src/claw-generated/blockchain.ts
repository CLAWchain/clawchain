import { Block } from './block';

export class Blockchain {
  private chain: Block[] = [];
  private pendingBlocks: Block[] = [];
  private finalityThreshold = 3;

  addBlock(block: Block) {
    // Validate block
    this.pendingBlocks.push(block);
    this.checkFinality();
  }

  private checkFinality() {
    // Check if any pending blocks have reached finality threshold
    for (let i = 0; i < this.pendingBlocks.length; i++) {
      const block = this.pendingBlocks[i];
      const confirmations = this.countConfirmations(block);
      if (confirmations >= this.finalityThreshold) {
        // Move finalized block to main chain
        this.chain.push(block);
        this.pendingBlocks.splice(i, 1);
        i--; // Adjust index to account for removed block
      }
    }
  }

  private countConfirmations(block: Block): number {
    // Count how many blocks have been added on top of the given block
    const index = this.chain.findIndex(b => b.hash === block.hash);
    return index === -1 ? 0 : this.chain.length - index;
  }

  getChain(): Block[] {
    return this.chain;
  }

  getPendingBlocks(): Block[] {
    return this.pendingBlocks;
  }

  getFinalityThreshold(): number {
    return this.finalityThreshold;
  }
}