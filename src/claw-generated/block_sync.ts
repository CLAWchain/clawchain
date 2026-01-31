import { Block, BlockHeader } from './blockchain/block';
import { PeerManager } from './network/PeerManager';
import { DatabaseService } from './storage/database';
import { CheckpointManager } from './checkpoint_manager';

export class BlockSyncManager {
  private peerManager: PeerManager;
  private database: DatabaseService;
  private checkpointManager: CheckpointManager;

  constructor(peerManager: PeerManager, database: DatabaseService, checkpointManager: CheckpointManager) {
    this.peerManager = peerManager;
    this.database = database;
    this.checkpointManager = checkpointManager;
  }

  async syncBlocks() {
    // 1. Query all connected peers for their latest block heights
    const peerHeights = await this.peerManager.getLatestBlockHeights();

    // 2. Determine the highest block height across all peers
    const maxHeight = Math.max(...Object.values(peerHeights));

    // 3. Check the local database for the current block height
    const localHeight = await this.database.getLatestBlockHeight();

    // 4. If the local height is less than the max height, download the missing blocks
    if (localHeight < maxHeight) {
      await this.downloadMissingBlocks(localHeight + 1, maxHeight);
    }
  }

  private async downloadMissingBlocks(fromHeight: number, toHeight: number) {
    const promises = [];

    // Check for checkpoints first
    for (let height = fromHeight; height <= toHeight; height += this.checkpointManager.checkpointInterval) {
      const checkpoint = await this.checkpointManager.getCheckpointByHeight(height);
      if (checkpoint) {
        // Skip verification for blocks before the checkpoint
        await this.database.storeBlocks(await this.downloadBlocksFromCheckpoint(height, checkpoint));
        fromHeight = height + this.checkpointManager.checkpointInterval;
      }
    }

    // Download any remaining blocks
    for (let height = fromHeight; height <= toHeight; height++) {
      promises.push(this.downloadBlockAtHeight(height));
    }

    await Promise.all(promises);
  }

  private async downloadBlocksFromCheckpoint(fromHeight: number, checkpoint: BlockHeader): Promise<Block[]> {
    const blocks = [];
    for (let height = fromHeight; height <= fromHeight + this.checkpointManager.checkpointInterval; height++) {
      const block = await this.downloadBlockAtHeight(height);
      blocks.push(block);
    }
    return blocks;
  }

  private async downloadBlockAtHeight(height: number): Promise<Block> {
    // 1. Request the block from multiple peers in parallel
    const blockPromises = this.peerManager.connectedPeers.map(async (peer) => {
      try {
        return await peer.getBlockByHeight(height);
      } catch (error) {
        console.error(`Error downloading block at height ${height} from peer ${peer.id}: ${error}`);
        return null;
      }
    });

    // 2. Wait for the first successful download
    const blocks = await Promise.all(blockPromises);
    const validBlock = blocks.find((block) => block !== null);

    if (!validBlock) {
      throw new Error(`Failed to download block at height ${height}`);
    }

    // 3. Verify the downloaded block
    await this.verifyBlock(validBlock);

    // 4. Persist the block to the local database
    await this.database.storeBlock(validBlock);

    // 5. Create a checkpoint if necessary
    await this.checkpointManager.createCheckpoint(validBlock);

    return validBlock;
  }

  private async verifyBlock(block: Block): Promise<void> {
    // TODO: Implement block verification logic
  }
}