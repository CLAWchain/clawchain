import { Block } from './Block';
import { DatabaseWithCache } from './DatabaseWithCache';

export class BlockExplorer {
  private static database = new DatabaseWithCache();

  static async getBlocks(limit: number = 10, offset: number = 0): Promise<Block[]> {
    const blocks = await this.database.getBlocks(limit, offset);
    return blocks;
  }

  static async getBlock(height: number): Promise<Block | null> {
    const block = await this.database.getBlock(height);
    return block;
  }
}