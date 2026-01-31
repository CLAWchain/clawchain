import { Block } from './block/block';
import { StateManager } from './state/StateManager';
import { CheckpointManager } from './checkpoint_manager';

export class BlockProcessingManager {
  private stateManager: StateManager;
  private checkpointManager: CheckpointManager;

  constructor(stateManager: StateManager, checkpointManager: CheckpointManager) {
    this.stateManager = stateManager;
    this.checkpointManager = checkpointManager;
  }

  async processBlock(block: Block): Promise<void> {
    // Apply the block to the state
    await this.stateManager.applyBlock(block);

    // Generate a checkpoint if necessary
    await this.checkpointManager.generateCheckpoint(block);
  }
}