import { Block } from './Block';
import { db, cache } from '../database/db';

const FINALITY_DEPTH = 10;

export class BlockFinality {
  private finalizedBlocks: Set<string> = new Set();

  async markBlockFinalized(block: Block): Promise<void> {
    this.finalizedBlocks.add(block.header.hash);

    try {
      // Save finalized block to database
      await db.query(
        'INSERT INTO finalized_blocks (block_hash, finalized_at) VALUES ($1, $2)',
        [block.header.hash, new Date().toISOString()]
      );

      // Update Redis cache
      await cache.set(`finalized_block:${block.header.hash}`, '1');
    } catch (error) {
      console.error('Error saving finalized block:', error);
    }
  }

  async isBlockFinalized(block: Block): Promise<boolean> {
    if (this.finalizedBlocks.has(block.header.hash)) {
      return true;
    }

    // Check database
    const result = await db.query(
      'SELECT 1 FROM finalized_blocks WHERE block_hash = $1',
      [block.header.hash]
    );
    if (result.rows.length > 0) {
      this.finalizedBlocks.add(block.header.hash);
      return true;
    }

    // Check confirmations
    const confirmations = await this.getBlockConfirmations(block);
    return confirmations >= FINALITY_DEPTH;
  }

  private async getBlockConfirmations(block: Block): Promise<number> {
    const latestBlock = await this.getLatestBlock();
    if (!latestBlock) {
      return 0;
    }
    return latestBlock.header.height - block.header.height + 1;
  }

  private async getLatestBlock(): Promise<Block | null> {
    const result = await db.query('SELECT * FROM blocks ORDER BY height DESC LIMIT 1');
    if (result.rows.length > 0) {
      return this.rowToBlock(result.rows[0]);
    }
    return null;
  }

  private rowToBlock(row: any): Block {
    // Same logic as in Chain.ts
    return new Block(
      row.height,
      row.parent_hash,
      row.producer,
      [],
      row.difficulty
    );
  }
}