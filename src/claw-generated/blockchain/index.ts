import { Block } from './block';
import { Transaction } from '../transactions';

export class Blockchain {
  private blocks: Block[] = [];

  addBlock(block: Block): boolean {
    if (block.validateTransactions()) {
      this.blocks.push(block);
      return true;
    }
    return false;
  }

  getLatestBlock(): Block {
    return this.blocks[this.blocks.length - 1];
  }

  getAllBlocks(): Block[] {
    return this.blocks;
  }
}