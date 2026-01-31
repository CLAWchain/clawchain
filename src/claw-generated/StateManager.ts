import { MerklePatriciaTrie } from '../state/MerklePatriciaTrie';
import { compress, decompress } from 'zlib';
import { StateSnapshotStorage } from './StateSnapshotStorage';

class StateManager {
  private trie: MerklePatriciaTrie;
  private snapshotInterval: number = 60 * 60 * 1000; // 1 hour
  private lastSnapshotTime: number = 0;
  private snapshotStorage: StateSnapshotStorage;

  constructor() {
    this.trie = new MerklePatriciaTrie();
    this.snapshotStorage = new StateSnapshotStorage();
  }

  // Methods for managing state
  get(key: Uint8Array): Uint8Array | undefined {
    return this.trie.get(key);
  }

  set(key: Uint8Array, value: Uint8Array): void {
    this.trie.set(key, value);
    this.maybeSnapshot();
  }

  private maybeSnapshot(): void {
    const now = Date.now();
    if (now - this.lastSnapshotTime >= this.snapshotInterval) {
      this.snapshot();
      this.lastSnapshotTime = now;
    }
  }

  private async snapshot(): Promise<void> {
    console.log('Taking state snapshot...');
    const snapshotData = this.trie.serialize();
    const compressedData = await compress(snapshotData);
    await this.snapshotStorage.storeSnapshot(compressedData);
  }

  static async restoreFromSnapshot(): Promise<StateManager> {
    const snapshotStorage = new StateSnapshotStorage();
    const snapshotData = await snapshotStorage.loadLatestSnapshot();
    if (!snapshotData) {
      return new StateManager();
    }

    const decompressedData = await decompress(snapshotData);
    const trie = MerklePatriciaTrie.deserialize(decompressedData);
    const stateManager = new StateManager();
    stateManager.trie = trie;
    return stateManager;
  }
}

export { StateManager };