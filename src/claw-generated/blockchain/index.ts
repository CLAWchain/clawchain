import { Block } from './block';
import { Transaction } from '../transactions';
import { GenesisBlock, GenesisConfiguration, initializeBlockchain } from './genesis';

export class Blockchain {
  private blocks: Block[] = [];

  constructor(config: GenesisConfiguration) {
    this.blocks = [initializeBlockchain(config).getLatestBlock()];
  }

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