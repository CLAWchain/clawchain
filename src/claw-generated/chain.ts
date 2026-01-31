import { Block } from '../blockchain/block';
import { Transaction } from '../blockchain/transaction';

export class Chain {
  private blocks: Block[] = [];

  addBlock(block: Block) {
    this.blocks.push(block);
  }

  getBlocks(): Block[] {
    return this.blocks;
  }

  findCommonAncestor(otherChain: Chain): Block {
    let thisChain = this.blocks;
    let otherChainBlocks = otherChain.getBlocks();

    // Find the index of the last common block
    let commonIndex = 0;
    while (commonIndex < Math.min(thisChain.length, otherChainBlocks.length)) {
      if (thisChain[commonIndex].hash !== otherChainBlocks[commonIndex].hash) {
        break;
      }
      commonIndex++;
    }

    return thisChain[commonIndex - 1];
  }

  revertToAncestor(ancestor: Block) {
    let ancestorIndex = this.blocks.findIndex(b => b.hash === ancestor.hash);
    this.blocks = this.blocks.slice(0, ancestorIndex + 1);
  }

  replayTransactions(newChain: Chain) {
    // Replay all transactions from the new chain, starting from the common ancestor
    let commonAncestor = this.findCommonAncestor(newChain);
    let newChainBlocks = newChain.getBlocks();
    let commonAncestorIndex = newChainBlocks.findIndex(b => b.hash === commonAncestor.hash);

    for (let i = commonAncestorIndex + 1; i < newChainBlocks.length; i++) {
      let block = newChainBlocks[i];
      for (let tx of block.transactions) {
        // Replay the transaction
        // ...
      }
    }
  }
}