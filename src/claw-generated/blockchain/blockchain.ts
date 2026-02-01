import { Block } from './block';
import { BlockPropagator } from '../networking/block_propagator';
import { PeerManager } from '../networking/peer_manager';

export class Blockchain {
  private blocks: Block[] = [];
  private uncleBlocks: Block[] = [];
  private blockPropagator: BlockPropagator;

  constructor(peerManager: PeerManager) {
    this.blockPropagator = new BlockPropagator(peerManager);
  }

  addBlock(block: Block) {
    // Check if the block is an uncle/ommer block
    if (this.isUncleBlock(block)) {
      // Apply partial reward to the miner
      this.applyUncleReward(block);
      this.uncleBlocks.push(block);
    } else {
      // Add the block to the main chain
      this.blocks.push(block);
      this.blockPropagator.propagateBlock(block);
    }
  }

  isUncleBlock(block: Block): boolean {
    const latestBlock = this.getLatestBlock();
    return block.previousHash !== latestBlock.hash;
  }

  applyUncleReward(block: Block) {
    // Calculate the partial reward based on the block's distance from the main chain
    // and update the miner's balance accordingly
  }

  getLatestBlock(): Block {
    return this.blocks[this.blocks.length - 1];
  }

  // Add this new method to handle high transaction load
  addBlocks(blocks: Block[]) {
    for (const block of blocks) {
      this.addBlock(block);
    }
  }
}