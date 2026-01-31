import { Block } from '../block/block';
import { CheckpointManager } from '../checkpoint_manager';

class GetBlockRpcMethod {
  private checkpointManager: CheckpointManager;

  constructor(checkpointManager: CheckpointManager) {
    this.checkpointManager = checkpointManager;
  }

  async getBlock(blockHash: string): Promise<Block | null> {
    // Fetch the block from the blockchain
    const block = await this.fetchBlock(blockHash);
    if (!block) {
      return null;
    }

    // Check if the block is before the latest checkpoint
    const latestCheckpoint = this.checkpointManager.getLatestCheckpoint();
    if (latestCheckpoint && block.height <= latestCheckpoint.blockHeight) {
      // Return the block without the transaction details
      return {
        hash: block.hash,
        height: block.height,
        parentHash: block.parentHash,
        timestamp: block.timestamp,
        transactions: []
      };
    }

    return block;
  }

  private async fetchBlock(blockHash: string): Promise<Block | null> {
    // Fetch the block from the blockchain storage
    // ...
  }
}

export { GetBlockRpcMethod };