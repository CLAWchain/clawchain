import { Trie } from './Trie';
import { TrieNode } from './TrieNode';
import { StateSnapshot } from './StateSnapshot';

class StateDiffManager {
  private trie: Trie;
  private stateDiffs: Map<number, Map<Buffer, TrieNode>>;

  constructor(trie: Trie) {
    this.trie = trie;
    this.stateDiffs = new Map();
  }

  trackStateChanges(blockNumber: number, changedNodes: Map<Buffer, TrieNode>): void {
    this.stateDiffs.set(blockNumber, changedNodes);
  }

  applyStateDiff(blockNumber: number): void {
    const changedNodes = this.stateDiffs.get(blockNumber);
    if (changedNodes) {
      for (const [key, node] of changedNodes) {
        this.trie.set(key, node.value);
      }
      this.trie.commit();
    }
  }

  getStateDiffForRange(fromBlock: number, toBlock: number): Map<number, Map<Buffer, TrieNode>> {
    const diffs = new Map();
    for (let i = fromBlock; i <= toBlock; i++) {
      const diff = this.stateDiffs.get(i);
      if (diff) {
        diffs.set(i, diff);
      }
    }
    return diffs;
  }

  pruneOldStateDiffs(currentBlockNumber: number, maxRecentBlocks: number): void {
    const oldestBlockToKeep = currentBlockNumber - maxRecentBlocks;
    for (const [blockNumber] of this.stateDiffs) {
      if (blockNumber < oldestBlockToKeep) {
        this.stateDiffs.delete(blockNumber);
      }
    }
  }
}

export { StateDiffManager };