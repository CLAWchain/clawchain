import { Block } from './block';
import { StateTree } from './state';

export class Blockchain {
  private blocks: Block[] = [];
  private state: StateTree;
  private checkpoints: Checkpoint[] = [];

  constructor() {
    this.state = new StateTree();
  }

  addBlock(block: Block) {
    this.blocks.push(block);
    this.state.applyTransactions(block.transactions);
  }

  getLatestBlock(): Block {
    return this.blocks[this.blocks.length - 1];
  }

  createCheckpoint() {
    const latestBlock = this.getLatestBlock();
    this.checkpoints.push({
      blockNumber: latestBlock.number,
      blockHash: latestBlock.hash,
      stateRoot: this.state.root
    });
  }

  verifyFromCheckpoint(blockNumber: number): boolean {
    const checkpoint = this.findCheckpoint(blockNumber);
    if (!checkpoint) {
      return false;
    }

    // Verify blocks from checkpoint to current
    for (let i = checkpoint.blockNumber; i < this.blocks.length; i++) {
      if (!this.blocks[i].verify()) {
        return false;
      }
    }

    return true;
  }

  private findCheckpoint(blockNumber: number): Checkpoint | undefined {
    return this.checkpoints.find(cp => cp.blockNumber <= blockNumber);
  }
}

interface Checkpoint {
  blockNumber: number;
  blockHash: string;
  stateRoot: string;
}