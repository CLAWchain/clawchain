import { Block } from './block/block';
import { BlockValidator } from './block-validator';
import { CheckpointManager } from './checkpoint_manager';
import { StateManager } from './state/StateManager';
import { DatabaseCache } from './DatabaseCache';

export class BlockSyncManager {
  private blockValidator: BlockValidator;
  private checkpointManager: CheckpointManager;
  private stateManager: StateManager;

  constructor(
    blockValidator: BlockValidator,
    checkpointManager: CheckpointManager,
    stateManager: StateManager,
    databaseCache: DatabaseCache
  ) {
    this.blockValidator = blockValidator;
    this.checkpointManager = checkpointManager;
    this.stateManager = stateManager;
  }

  async syncBlocks(blocks: Block[]): Promise<void> {
    for (const block of blocks) {
      // Check if there's a checkpoint at the current block height
      const checkpoint = await this.checkpointManager.loadCheckpoint(block.height);
      if (checkpoint) {
        // Verify the block hash and state root against the checkpoint
        if (block.hash === checkpoint.blockHash && (await this.stateManager.getStateRoot()) === checkpoint.stateRoot) {
          // Skip verification for blocks before the checkpoint
          await this.stateManager.applyBlock(block);
          await this.checkpointManager.generateCheckpoint(block);
          continue;
        }
      }

      // Verify the block normally
      await this.blockValidator.validateBlock(block);
      await this.stateManager.applyBlock(block);
      await this.checkpointManager.generateCheckpoint(block);
    }
  }
}