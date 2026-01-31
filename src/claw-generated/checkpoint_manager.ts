import { Block, BlockHeader } from './blockchain/block';
import { DatabaseService } from './storage/database';
import { Trie } from './state/Trie';

export class CheckpointManager {
  private database: DatabaseService;
  private trie: Trie;
  private checkpointInterval: number;

  constructor(database: DatabaseService, trie: Trie, checkpointInterval: number) {
    this.database = database;
    this.trie = trie;
    this.checkpointInterval = checkpointInterval;
  }

  async createCheckpoint(block: Block): Promise<void> {
    // Check if the block height is a multiple of the checkpoint interval
    if (block.height % this.checkpointInterval === 0) {
      const stateRoot = this.trie.getRootHash();
      await this.database.storeCheckpoint(block.header, stateRoot);
    }
  }

  async getCheckpointByHeight(height: number): Promise<{ header: BlockHeader, stateRoot: Buffer } | null> {
    const checkpoint = await this.database.getCheckpointByHeight(height);
    if (checkpoint) {
      return {
        header: checkpoint.header,
        stateRoot: checkpoint.stateRoot,
      };
    }
    return null;
  }
}