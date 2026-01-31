import { Block } from './block';
import { Transaction } from './transaction';
import { AccountState } from './account';

export class Chain {
  private blocks: Block[] = [];
  private accountState: AccountState = new AccountState();

  addBlock(block: Block) {
    this.blocks.push(block);
    this.updateAccountState(block);
  }

  getBlocks() {
    return this.blocks;
  }

  /**
   * Handle chain reorganization when a longer valid chain is discovered.
   * - Revert transactions from the current chain
   * - Replay transactions on the new longer chain
   */
  handleChainReorg(newChain: Block[]) {
    // Find the common ancestor block between the current and new chains
    const commonAncestorIndex = this.findCommonAncestor(newChain);

    // Revert transactions from the current chain
    for (let i = commonAncestorIndex + 1; i < this.blocks.length; i++) {
      this.revertTransactions(this.blocks[i]);
    }

    // Replay transactions on the new chain
    for (let i = commonAncestorIndex + 1; i < newChain.length; i++) {
      this.replayTransactions(newChain[i]);
    }

    // Update the chain with the new longer valid chain
    this.blocks = newChain;
  }

  private findCommonAncestor(newChain: Block[]): number {
    // Iterate through the current and new chains, comparing block hashes
    for (let i = 0; i < Math.min(this.blocks.length, newChain.length); i++) {
      if (this.blocks[i].hash !== newChain[i].hash) {
        return i - 1;
      }
    }

    // If the new chain is a strict superset of the current chain, return the current chain length
    return this.blocks.length - 1;
  }

  private revertTransactions(block: Block) {
    // Revert the state changes for each transaction in the block
    for (const tx of block.transactions) {
      this.accountState.revertTransaction(tx);
    }
  }

  private replayTransactions(block: Block) {
    // Replay the transactions in the block, updating the account state
    for (const tx of block.transactions) {
      this.accountState.applyTransaction(tx);
    }
  }

  private updateAccountState(block: Block) {
    // Apply the transactions in the block to the account state
    for (const tx of block.transactions) {
      this.accountState.applyTransaction(tx);
    }
  }
}