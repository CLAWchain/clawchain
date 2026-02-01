import { Block } from './block';
import { BlockPropagator } from '../networking/block_propagator';
import { PeerManager } from '../networking/peer_manager';
import { AccountStorage } from '../AccountStorage';
import { ContractStorage } from '../contracts/ContractStorage';
import { zlib } from 'zlib';
import { fs } from 'fs';
import { path } from 'path';

export class Blockchain {
  private blocks: Block[] = [];
  private uncleBlocks: Block[] = [];
  private blockPropagator: BlockPropagator;
  private accountStorage: AccountStorage;
  private contractStorage: ContractStorage;
  private snapshotInterval: number = 60 * 60 * 1000; // 1 hour
  private snapshotPath: string = 'data/snapshots';

  constructor(peerManager: PeerManager, accountStorage: AccountStorage, contractStorage: ContractStorage) {
    this.blockPropagator = new BlockPropagator(peerManager);
    this.accountStorage = accountStorage;
    this.contractStorage = contractStorage;
    this.startSnapshotTimer();
  }

  addBlock(block: Block) {
    // Check if the block is an uncle/ommer block
    if (this.isUncleBlock(block)) {
      // Apply partial reward to the miner
      this.applyUncleReward(block);
      this.uncleBlocks.push(block);
    } else {
      // Check if the new block extends the current longest chain
      if (this.isLongerChain(block)) {
        // Trigger chain reorganization
        this.reorganizeChain(block);
      } else {
        // Add the block to the main chain
        this.blocks.push(block);
        this.blockPropagator.propagateBlock(block);
        this.updateStateFromBlock(block);
        this.maybeCreateSnapshot();
      }
    }
  }

  private isLongerChain(newBlock: Block): boolean {
    // Check if the new block's parent hash matches the current tip
    const currentTip = this.blocks[this.blocks.length - 1];
    return newBlock.parentHash === currentTip.hash && newBlock.height > currentTip.height;
  }

  private reorganizeChain(newLongerBlock: Block) {
    // Find the common ancestor between the current chain and the new longer chain
    const commonAncestor = this.findCommonAncestor(newLongerBlock);

    // Revert the state changes from the previous shorter chain
    this.revertChainFromBlock(commonAncestor.nextBlock);

    // Replay the transactions from the new longer chain
    this.replayChainFromBlock(commonAncestor.nextBlock, newLongerBlock);

    // Update the blockchain data structures
    this.updateChainState(commonAncestor, newLongerBlock);
  }

  private findCommonAncestor(newBlock: Block): { block: Block; nextBlock: Block } {
    // Traverse the current chain to find the common ancestor
    let currentBlock = this.blocks[this.blocks.length - 1];
    while (currentBlock.height > newBlock.height) {
      currentBlock = this.blocks[this.blocks.indexOf(currentBlock) - 1];
    }

    while (currentBlock.hash !== newBlock.parentHash) {
      currentBlock = this.blocks[this.blocks.indexOf(currentBlock) - 1];
    }

    return { block: currentBlock, nextBlock: this.blocks[this.blocks.indexOf(currentBlock) + 1] };
  }

  private revertChainFromBlock(block: Block) {
    // Revert the state changes for all blocks starting from the given block
    for (let i = this.blocks.indexOf(block); i < this.blocks.length; i++) {
      this.revertBlockState(this.blocks[i]);
    }
  }

  private replayChainFromBlock(startBlock: Block, endBlock: Block) {
    // Replay the transactions for all blocks from the start block to the end block
    for (let i = this.blocks.indexOf(startBlock); i < this.blocks.indexOf(endBlock) + 1; i++) {
      this.updateStateFromBlock(this.blocks[i]);
    }
  }

  private updateChainState(commonAncestor: { block: Block; nextBlock: Block }, newLongerBlock: Block) {
    // Update the blockchain data structures to reflect the new longest chain
    this.blocks = this.blocks.slice(0, this.blocks.indexOf(commonAncestor.nextBlock));
    this.blocks.push(newLongerBlock);
    this.blocks.push(...this.blocks.slice(this.blocks.indexOf(commonAncestor.nextBlock) + 1));
  }

  private revertBlockState(block: Block) {
    // Revert the account and contract state changes for the given block
    this.accountStorage.revertStateChanges(block);
    this.contractStorage.revertStateChanges(block);
  }

  private updateStateFromBlock(block: Block) {
    // Apply the account and contract state changes for the given block
    this.accountStorage.applyStateChanges(block);
    this.contractStorage.applyStateChanges(block);
  }

  // ... other methods ...
}