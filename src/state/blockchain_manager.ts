import { Block } from './block';
import { BlockSyncManager } from '../networking/block_sync_manager';
import { Peer } from '../networking/peer';
import { Transaction } from '../transaction';

export class BlockchainManager {
  private blocks: Block[];
  private blockSyncManager: BlockSyncManager;

  constructor(peers: Peer[]) {
    this.blocks = [];
    this.blockSyncManager = new BlockSyncManager(peers, this);
  }

  async getLatestBlockHash(): Promise<string> {
    if (this.blocks.length === 0) {
      return '';
    }
    return this.blocks[this.blocks.length - 1].hash;
  }

  async getMissingBlockHashes(latestHash: string): Promise<string[]> {
    // Find the index of the latest block in the local blockchain
    const latestIndex = this.blocks.findIndex((block) => block.hash === latestHash);

    // If the latest block is not found, return all block hashes
    if (latestIndex === -1) {
      return this.blocks.map((block) => block.hash);
    }

    // Otherwise, return the hashes of all blocks after the latest one
    return this.blocks.slice(latestIndex + 1).map((block) => block.hash);
  }

  async addBlock(block: Block): Promise<void> {
    // Calculate the total transaction fees in the block
    let totalFees = 0;
    for (const tx of block.transactions) {
      totalFees += tx.fee;
    }

    // Add the transaction fees to the block reward
    block.reward += totalFees;

    // Add the block to the blockchain
    this.blocks.push(block);
  }

  async syncBlocks(): Promise<void> {
    await this.blockSyncManager.syncBlocks();
  }
}