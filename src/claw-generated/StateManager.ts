import { Block } from '../blockchain/Block';
import { StateSnapshot } from './StateSnapshot';

class StateManager {
  private stateSnapshots: StateSnapshot[] = [];
  private currentSnapshot: StateSnapshot;
  private maxSnapshotAge: number = 100; // Keep snapshots for the last 100 blocks

  constructor() {
    this.currentSnapshot = new StateSnapshot();
  }

  applyBlockToState(block: Block) {
    this.currentSnapshot.applyBlock(block);
  }

  commitStateSnapshot() {
    this.stateSnapshots.push(this.currentSnapshot);
    this.currentSnapshot = new StateSnapshot();
    this.pruneOldSnapshots();
  }

  getPreviousStateSnapshot(blockNumber: number): StateSnapshot {
    // Find the closest state snapshot before the given block number
    for (let i = this.stateSnapshots.length - 1; i >= 0; i--) {
      if (this.stateSnapshots[i].blockNumber <= blockNumber) {
        return this.stateSnapshots[i];
      }
    }
    throw new Error(`No state snapshot found for block ${blockNumber}`);
  }

  private pruneOldSnapshots() {
    // Remove snapshots that are older than the max snapshot age
    const currentBlockNumber = this.stateSnapshots[this.stateSnapshots.length - 1]?.blockNumber || 0;
    this.stateSnapshots = this.stateSnapshots.filter(snapshot => snapshot.blockNumber >= currentBlockNumber - this.maxSnapshotAge);
  }
}

export { StateManager };