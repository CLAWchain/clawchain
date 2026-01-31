import { Block } from '../blockchain/block';
import { Transaction } from '../blockchain/transaction';

class CompactBlock {
  blockHeader: Buffer;
  transactionHashes: Buffer[];

  constructor(block: Block) {
    this.blockHeader = block.header.serialize();
    this.transactionHashes = block.transactions.map(tx => tx.hash());
  }

  serialize(): Buffer {
    // TODO: Implement serialization of compact block
    return Buffer.concat([this.blockHeader, Buffer.from(this.transactionHashes.length), ...this.transactionHashes]);
  }
}

export { CompactBlock };