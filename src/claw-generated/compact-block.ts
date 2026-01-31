import { Block } from '../blockchain/block';

export class CompactBlock {
  public blockHash: string;
  public parentHash: string;
  public transactions: string[];

  constructor(block: Block) {
    this.blockHash = block.hash;
    this.parentHash = block.parentHash;
    this.transactions = block.transactions.map(tx => tx.hash);
  }

  toBuffer(): Buffer {
    // Serialize the compact block to a buffer
  }

  static fromBuffer(buffer: Buffer): CompactBlock {
    // Deserialize a compact block from a buffer
  }
}