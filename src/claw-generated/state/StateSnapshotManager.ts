import { StateTree } from './StateTree';
import { StateManager } from './StateManager';
import { snappy } from 'snappy';

class StateSnapshotManager {
  private stateManager: StateManager;
  private snapshotInterval: number;
  private lastSnapshotBlock: number;

  constructor(stateManager: StateManager, snapshotInterval: number) {
    this.stateManager = stateManager;
    this.snapshotInterval = snapshotInterval;
    this.lastSnapshotBlock = 0;
  }

  async takeSnapshot(blockNumber: number): Promise<void> {
    // Get the current state tree
    const stateTree = await this.stateManager.getStateTree();

    // Compress the state tree
    const snapshotData = await this.compressStateTree(stateTree);

    // Store the snapshot
    await this.storeSnapshot(blockNumber, snapshotData);

    // Update the last snapshot block
    this.lastSnapshotBlock = blockNumber;
  }

  async restoreFromSnapshot(blockNumber: number): Promise<StateTree> {
    // Fetch the snapshot data
    const snapshotData = await this.fetchSnapshot(blockNumber);

    // Decompress the state tree
    const stateTree = await this.decompressStateTree(snapshotData);

    return stateTree;
  }

  private async compressStateTree(stateTree: StateTree): Promise<Uint8Array> {
    // Compress the state tree using Snappy
    return await snappy.compress(stateTree.serialize());
  }

  private async decompressStateTree(snapshotData: Uint8Array): Promise<StateTree> {
    // Decompress the state tree using Snappy
    const decompressedData = await snappy.uncompress(snapshotData);
    return StateTree.deserialize(decompressedData);
  }

  private async storeSnapshot(blockNumber: number, snapshotData: Uint8Array): Promise<void> {
    // Store the snapshot data in a persistent storage
    await this.stateManager.storeSnapshot(blockNumber, snapshotData);
  }

  private async fetchSnapshot(blockNumber: number): Promise<Uint8Array> {
    // Fetch the snapshot data from persistent storage
    return await this.stateManager.fetchSnapshot(blockNumber);
  }
}

export { StateSnapshotManager };