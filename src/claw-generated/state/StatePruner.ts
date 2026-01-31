import { Trie } from './Trie';
import { TrieCache } from './TrieCache';
import { StateSnapshot } from './StateSnapshot';
import { StateSnapshotStorage } from './StateSnapshotStorage';

class StatePruner {
  private trie: Trie;
  private cache: TrieCache;
  private maxRecentBlocks: number;
  private archiveCheckpointInterval: number;
  private snapshotStorage: StateSnapshotStorage;

  constructor(trie: Trie, cache: TrieCache, maxRecentBlocks: number, archiveCheckpointInterval: number, snapshotStorage: StateSnapshotStorage) {
    this.trie = trie;
    this.cache = cache;
    this.maxRecentBlocks = maxRecentBlocks;
    this.archiveCheckpointInterval = archiveCheckpointInterval;
    this.snapshotStorage = snapshotStorage;
  }

  prune(currentBlockNumber: number): void {
    // Step 1: Remove old state data from the Trie
    this.pruneOldStateNodes(currentBlockNumber - this.maxRecentBlocks);

    // Step 2: Archive state checkpoints for older blocks
    this.archiveStateCheckpoints(currentBlockNumber);
  }

  private async pruneOldStateNodes(oldestBlockNumber: number): Promise<void> {
    // Traverse the Trie and remove nodes that are older than the oldest block to keep
    await this.trie.pruneOldNodes(oldestBlockNumber);

    // Update the TrieCache to reflect the pruned state
    this.cache.invalidateOldEntries(oldestBlockNumber);
  }

  private async archiveStateCheckpoints(currentBlockNumber: number): Promise<void> {
    // Archive state checkpoints for blocks older than the current block - archiveCheckpointInterval
    const oldestBlockToArchive = currentBlockNumber - this.archiveCheckpointInterval;

    for (let blockNumber = oldestBlockToArchive; blockNumber < currentBlockNumber; blockNumber += this.archiveCheckpointInterval) {
      const snapshot = await this.trie.takeSnapshot(blockNumber);
      await this.snapshotStorage.storeSnapshot(blockNumber, snapshot);

      // Update the Trie and TrieCache to reflect the archived state
      this.trie.loadSnapshot(snapshot);
      this.cache.invalidateOldEntries(blockNumber);
    }
  }
}

export { StatePruner };