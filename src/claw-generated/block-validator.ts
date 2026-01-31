import { Block } from './block/block';
import { CheckpointManager } from './checkpoint_manager';

class BlockValidator {
  private checkpointManager: CheckpointManager;

  constructor(checkpointManager: CheckpointManager) {
    this.checkpointManager = checkpointManager;
  }

  validateBlock(block: Block): boolean {
    const latestCheckpoint = this.checkpointManager.getLatestCheckpoint();
    if (latestCheckpoint && block.height <= latestCheckpoint.blockHeight) {
      // Skip verification for blocks before the latest checkpoint
      return true;
    }

    // Perform regular block validation checks
    // ...

    return true;
  }
}

export { BlockValidator };