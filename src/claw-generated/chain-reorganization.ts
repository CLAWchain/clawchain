import { Block, Transaction } from './Block';
import { Chain } from './Chain';
import { StateManager } from './state/StateManager';
import { TransactionPool } from './TransactionPool';

export class ChainReorganization {
  private chain: Chain;
  private stateManager: StateManager;
  private transactionPool: TransactionPool;

  constructor(chain: Chain, stateManager: StateManager, transactionPool: TransactionPool) {
    this.chain = chain;
    this.stateManager = stateManager;
    this.transactionPool = transactionPool;
  }

  async reorganizeChain(newChain: Block[]): Promise<boolean> {
    // Find the fork point between the current and new chains
    const forkPoint = this.findForkPoint(this.chain.blocks, newChain);
    if (forkPoint === -1) {
      console.error('No common ancestor found between the current and new chains');
      return false;
    }

    // Revert the current chain from the fork point
    await this.revertChain(this.chain.blocks.slice(forkPoint + 1));

    // Replay the new chain from the fork point
    for (let i = forkPoint + 1; i < newChain.length; i++) {
      await this.chain.addBlock(newChain[i]);
    }

    // Update chain metadata
    this.chain.updateChainMetadata();

    return true;
  }

  private findForkPoint(currentChain: Block[], newChain: Block[]): number {
    let forkPoint = -1;

    for (let i = 0; i < Math.min(currentChain.length, newChain.length); i++) {
      if (currentChain[i].header.hash === newChain[i].header.hash) {
        forkPoint = i;
      } else {
        break;
      }
    }

    return forkPoint;
  }

  private async revertChain(blocksToRevert: Block[]): Promise<void> {
    for (const block of blocksToRevert.reverse()) {
      // Revert state changes
      await this.stateManager.revertStateChanges(block);

      // Remove transactions from the pool
      for (const tx of block.transactions) {
        this.transactionPool.removeTransaction(tx);
      }
    }
  }
}