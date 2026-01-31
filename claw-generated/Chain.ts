import { Block, Transaction } from './Block';
import { db, cache, chainState } from './database';
import { forkManager, difficultyManager } from './Consensus';
import { eventBus } from './EventBus';

// Genesis parent hash in base58 format
const GENESIS_PARENT_HASH = 'CLAWChainGenesisBlock00000000000000000000000';

// Fork resolution configuration
const MAX_REORG_DEPTH = 100;

export class Chain {
  private blocks: Block[] = [];
  private difficulty: number = 1;
  private genesisTime: number = 0;
  private totalTransactions: number = 0;
  private orphanedBlocks: Block[] = []; // Blocks waiting for parent

  async initialize() {
    // ...
  }

  private rowToBlock(row: any): Block {
    // ...
  }

  private createGenesisBlock(): Block {
    // ...
  }

  async addBlock(block: Block): Promise<boolean> {
    // ...
  }

  getLatestBlock(): Block | undefined {
    // ...
  }

  getBlockByHeight(height: number): Block | undefined {
    // ...
  }

  getBlockByHash(hash: string): Block | undefined {
    // ...
  }

  getAllBlocks(): Block[] {
    // ...
  }

  getChainLength(): number {
    // ...
  }

  getGenesisTime(): number {
    // ...
  }

  getTotalTransactions(): number {
    // ...
  }

  getRecentBlocks(count: number = 10): Block[] {
    // ...
  }

  async handleReorg(newBlocks: Block[], commonAncestorHeight: number): Promise<{
    success: boolean;
    orphaned: Block[];
    added: Block[];
  }> {
    const result = {
      success: false,
      orphaned: [] as Block[],
      added: [] as Block[]
    };

    // Validate reorg depth
    const reorgDepth = this.blocks.length - commonAncestorHeight - 1;
    if (reorgDepth > MAX_REORG_DEPTH) {
      console.error(`[CHAIN] Reorg too deep: ${reorgDepth} > ${MAX_REORG_DEPTH}`);
      return result;
    }

    // Get blocks being orphaned
    result.orphaned = this.blocks.slice(commonAncestorHeight + 1);

    // Validate new blocks form a valid chain
    for (let i = 0; i < newBlocks.length; i++) {
      const block = newBlocks[i];
      const prevBlock = i === 0
        ? this.blocks[commonAncestorHeight]
        : newBlocks[i - 1];

      if (!block.isValid(prevBlock)) {
        console.error(`[CHAIN] Invalid block in reorg chain at height ${block.header.height}`);
        return result;
      }
    }

    // Check that new chain is longer
    const newLength = commonAncestorHeight + 1 + newBlocks.length;
    if (newLength <= this.blocks.length) {
      console.log(`[CHAIN] New chain not longer: ${newLength} <= ${this.blocks.length}`);
      return result;
    }

    console.log(`[CHAIN] Reorganizing: depth=${reorgDepth}, orphaning ${result.orphaned.length} blocks, adding ${newBlocks.length}`);

    // Truncate main chain to common ancestor
    this.blocks = this.blocks.slice(0, commonAncestorHeight + 1);

    // Add new blocks
    for (const block of newBlocks) {
      const added = await this.addBlock(block);
      if (added) {
        result.added.push(block);
      } else {
        console.error(`[CHAIN] Failed to add block ${block.header.height} during reorg`);
        // Try to restore orphaned blocks
        for (const orphan of result.orphaned) {
          await this.addBlock(orphan);
        }
        return result;
      }
    }

    // Move orphaned blocks to orphan pool for potential reprocessing
    this.orphanedBlocks.push(...result.orphaned);

    // Emit reorg event
    eventBus.emit('chain_reorg', {
      orphaned: result.orphaned,
      added: result.added
    });

    result.success = true;
    return result;
  }
}