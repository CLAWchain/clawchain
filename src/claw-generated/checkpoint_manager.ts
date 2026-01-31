import { Block, BlockHeader } from './blockchain/block';
import { DatabaseService } from './storage/database';

export class CheckpointManager {
  private database: DatabaseService;
  private checkpointInterval: number;

  constructor(database: DatabaseService, checkpointInterval: number) {
    this.database = database;
    this.checkpointInterval = checkpointInterval;
  }

  async createCheckpoint(block: Block): Promise<void> {
    // Check if the block height is a multiple of the checkpoint interval
    if (block.height % this.checkpointInterval === 0) {
      await this.database.storeCheckpoint(block.header);
    }
  }

  async getCheckpointByHeight(height: number): Promise<BlockHeader | null> {
    return this.database.getCheckpointByHeight(height);
  }
}