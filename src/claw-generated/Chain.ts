import { Block, Transaction, generateRandomBase58 } from './Block';
import { db, cache, chainState } from '../database/db';
import { forkManager, difficultyManager } from './Consensus';
import { eventBus } from '../events/EventBus';
import { BlockFinality } from './BlockFinality';

const GENESIS_PARENT_HASH = 'CLAWChainGenesisBlock00000000000000000000000';
const MAX_REORG_DEPTH = 100;

export class Chain {
  private blocks: Block[] = [];
  private difficulty: number = 1;
  private genesisTime: number = 0;
  private totalTransactions: number = 0;
  private orphanedBlocks: Block[] = [];
  private blockFinality: BlockFinality;

  constructor() {
    this.blockFinality = new BlockFinality();
  }

  async initialize() {
    // ... (existing initialization logic)

    // Load finalized blocks from database
    await this.loadFinalizedBlocks();
  }

  private async loadFinalizedBlocks() {
    try {
      const result = await db.query('SELECT block_hash FROM finalized_blocks');
      for (const row of result.rows) {
        this.blockFinality.finalizedBlocks.add(row.block_hash);
      }
      console.log(`[CHAIN] Loaded ${this.blockFinality.finalizedBlocks.size} finalized blocks`);
    } catch (error) {
      console.error('Error loading finalized blocks:', error);
    }
  }

  async addBlock(block: Block): Promise<boolean> {
    const lastBlock = this.getLatestBlock();

    if (this.blocks.length > 0 && !block.isValid(lastBlock)) {
      console.error('Invalid block rejected');
      return false;
    }

    this.blocks.push(block);
    this.totalTransactions += block.transactions.length;

    try {
      // Save block to database
      // ... (existing block saving logic)

      // Mark block as finalized if it has enough confirmations
      if (await this.blockFinality.isBlockFinalized(block)) {
        await this.blockFinality.markBlockFinalized(block);
      }

      // Update Redis cache
      await chainState.saveBlockHeight(this.blocks.length);
      await chainState.saveTotalTransactions(this.totalTransactions);
      await chainState.saveBlock(block.toJSON());
    } catch (error) {
      console.error('Error saving block to database:', error);
      // Block still added to memory, will retry on next save
    }

    return true;
  }

  // ... (existing Chain class methods)
}