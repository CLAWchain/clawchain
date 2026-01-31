import { Block } from '../types';

export async function getBlock(slotNumber: number, includeTransactions: boolean, encoding: 'json' | 'binary'): Promise<Block> {
  // Look up the block by slot number in the database
  const block = await db.getBlockBySlot(slotNumber);

  // Optionally include transaction details
  if (includeTransactions) {
    block.transactions = await Promise.all(block.transactionIds.map(id => db.getTransaction(id)));
  }

  // Encode the block data based on the requested format
  if (encoding === 'binary') {
    block.data = block.data.toBinary();
  }

  return block;
}