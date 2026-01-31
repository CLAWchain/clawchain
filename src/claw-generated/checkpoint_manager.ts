import { Block } from './block/block';

class CheckpointManager {
  private checkpoints: { 
    blockHash: string; 
    blockHeight: number;
    timestamp: number;
  }[] = [];
  private checkpointInterval: number = 10000;

  generateCheckpoint(block: Block): void {
    if (block.height % this.checkpointInterval === 0) {
      this.checkpoints.push({
        blockHash: block.hash,
        blockHeight: block.height,
        timestamp: block.timestamp
      });
    }
  }

  getLatestCheckpoint(): { 
    blockHash: string; 
    blockHeight: number;
    timestamp: number; 
  } | null {
    if (this.checkpoints.length > 0) {
      return this.checkpoints[this.checkpoints.length - 1];
    } else {
      return null;
    }
  }

  getCheckpointByHeight(height: number): { 
    blockHash: string; 
    blockHeight: number;
    timestamp: number; 
  } | null {
    return this.checkpoints.find(cp => cp.blockHeight === height) || null;
  }
}

export { CheckpointManager };