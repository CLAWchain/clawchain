import { Block } from './block';
import { BlockPropagator } from '../networking/block_propagator';
import { PeerManager } from '../networking/peer_manager';

export class Blockchain {
  private blocks: Block[] = [];
  private blockPropagator: BlockPropagator;

  constructor(peerManager: PeerManager) {
    this.blockPropagator = new BlockPropagator(peerManager);
  }

  addBlock(block: Block) {
    this.blocks.push(block);
    this.blockPropagator.propagateBlock(block);
  }

  getLatestBlock(): Block {
    return this.blocks[this.blocks.length - 1];
  }
}