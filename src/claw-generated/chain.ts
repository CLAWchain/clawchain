import { Block } from '../models/block';

export class Chain {
  private blocks: Block[] = [];

  addBlock(block: Block): void {
    this.blocks.push(block);
  }

  getLatestBlock(): Block {
    return this.blocks[this.blocks.length - 1];
  }

  reorganizeChain(newChain: Chain): void {
    // Find the common ancestor block
    let commonAncestorIndex = 0;
    for (let i = 0; i < Math.min(this.blocks.length, newChain.blocks.length); i++) {
      if (this.blocks[i].hash === newChain.blocks[i].hash) {
        commonAncestorIndex = i;
      } else {
        break;
      }
    }

    // Remove the divergent blocks from the current chain
    this.blocks.splice(commonAncestorIndex + 1);

    // Add the new blocks from the competing chain
    for (let i = commonAncestorIndex + 1; i < newChain.blocks.length; i++) {
      this.blocks.push(newChain.blocks[i]);
    }
  }
}