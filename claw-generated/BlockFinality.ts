import { Block } from './block';
import { forkManager, CONFIG } from './Consensus';

export class BlockFinality {
  private finalizedBlocks: Map<string, number> = new Map();

  /**
   * Update the finality status of a block.
   * @param block The block to update.
   */
  updateFinality(block: Block): void {
    const blockHash = block.header.hash;
    const depth = forkManager.getDepthFromTip(blockHash);

    if (depth >= CONFIG.FORK_CHOICE_DEPTH) {
      this.finalizedBlocks.set(blockHash, depth);
    } else {
      this.finalizedBlocks.delete(blockHash);
    }
  }

  /**
   * Check if a block is finalized.
   * @param blockHash The hash of the block to check.
   * @returns True if the block is finalized, false otherwise.
   */
  isFinalized(blockHash: string): boolean {
    return this.finalizedBlocks.has(blockHash);
  }

  /**
   * Get the finality depth of a block.
   * @param blockHash The hash of the block to check.
   * @returns The finality depth if the block is finalized, otherwise -1.
   */
  getFinalityDepth(blockHash: string): number {
    return this.finalizedBlocks.get(blockHash) || -1;
  }
}

export const blockFinality = new BlockFinality();