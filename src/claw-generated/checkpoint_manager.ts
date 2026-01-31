import { Block } from './block/block';
import { StateManager } from './state/StateManager';
import { DatabaseCache } from './DatabaseCache';

export class CheckpointManager {
  private stateManager: StateManager;
  private databaseCache: DatabaseCache;
  private checkpointInterval: number = 10000; // Generate checkpoint every 10,000 blocks

  constructor(stateManager: StateManager, databaseCache: DatabaseCache) {
    this.stateManager = stateManager;
    this.databaseCache = databaseCache;
  }

  async generateCheckpoint(block: Block): Promise<void> {
    if (block.height % this.checkpointInterval === 0) {
      const stateRoot = await this.stateManager.getStateRoot();
      const checkpoint = {
        blockHash: block.hash,
        stateRoot,
        blockHeight: block.height,
        timestamp: block.timestamp,
        // Add other relevant metadata
      };
      await this.databaseCache.storeCheckpoint(checkpoint);
    }
  }

  async loadCheckpoint(blockHeight: number): Promise<Checkpoint | null> {
    return await this.databaseCache.getCheckpoint(blockHeight);
  }
}

export interface Checkpoint {
  blockHash: string;
  stateRoot: string;
  blockHeight: number;
  timestamp: number;
  // Add other relevant metadata
}