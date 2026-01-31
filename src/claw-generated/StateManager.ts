import { Block } from '../blockchain/Block';
import { StateSnapshot } from './StateSnapshot';

class StateManager {
  private stateSnapshots: StateSnapshot[] = [];
  private currentSnapshot: StateSnapshot;
  private maxSnapshotAge: number = 100; // Keep snapshots for the last 100 blocks
  private snapshotInterval: number = 100; // Create a new snapshot every 100 blocks

  constructor() {
    this.currentSnapshot = new StateSnapshot(0, '0x0');
  }

  applyBlockToState(block: Block) {
    this.currentSnapshot.applyBlock(block);
  }

  commitStateSnapshot() {
    this.stateSnapshots.push(this.currentSnapshot);
    this.currentSnapshot = new StateSnapshot(this.currentSnapshot.blockNumber + 1, this.currentSnapshot.stateRoot);
    this.pruneOldSnapshots();
  }

  getStateDiff(fromBlockNumber: number, toBlockNumber: number): Map<string, any> {
    const fromSnapshot = this.getPreviousStateSnapshot(fromBlockNumber);
    const toSnapshot = this.getPreviousStateSnapshot(toBlockNumber);
    return toSnapshot.getDiff(fromSnapshot);
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

  downloadStateSnapshot(blockNumber: number): Uint8Array {
    const snapshot = this.getPreviousStateSnapshot(blockNumber);
    return snapshot.compressedData;
  }

  applyStateSnapshot(blockNumber: number, snapshotData: Uint8Array) {
    const snapshot = new StateSnapshot(blockNumber, '0x0');
    snapshot.compressedData = snapshotData;
    this.stateSnapshots.push(snapshot);
    this.currentSnapshot = snapshot.decompress();
  }

  private pruneOldSnapshots() {
    // Remove snapshots that are older than the max snapshot age
    const currentBlockNumber = this.stateSnapshots[this.stateSnapshots.length - 1]?.blockNumber || 0;
    this.stateSnapshots = this.stateSnapshots.filter(snapshot => snapshot.blockNumber >= currentBlockNumber - this.maxSnapshotAge);
  }

  private shouldCreateSnapshot(): boolean {
    return this.currentSnapshot.blockNumber % this.snapshotInterval === 0;
  }

  updateState(block: Block) {
    this.applyBlockToState(block);

    if (this.shouldCreateSnapshot()) {
      this.commitStateSnapshot();
    }
  }
}

export { StateManager };