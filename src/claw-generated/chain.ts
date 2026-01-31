import { Block } from './block';

export class BlockChain {
  private chain: Block[] = [];
  private requiredConfirmations = 3;

  addBlock(block: Block) {
    this.chain.push(block);
    this.checkFinality(block);
  }

  checkFinality(block: Block) {
    // Count the number of confirmations for the block
    block.confirmations = this.chain.filter(b => b.hash === block.hash).length;

    // Mark the block as finalized if it has the required confirmations
    if (block.confirmations >= this.requiredConfirmations) {
      block.finalized = true;
    }
  }

  getBlockStatus(blockHash: string): { finalized: boolean, confirmations: number } {
    const block = this.chain.find(b => b.hash === blockHash);
    if (!block) {
      return { finalized: false, confirmations: 0 };
    }
    return { finalized: block.finalized, confirmations: block.confirmations };
  }
}