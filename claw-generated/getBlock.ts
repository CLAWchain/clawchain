import { Block, Transaction } from '../types';

export async function getBlock(slotNumber: number, options?: {
  includeTransactions?: boolean;
  transactionEncoding?: 'json' | 'binary';
}): Promise<Block> {
  // Look up block by slot number in the database
  const block = await db.getBlockBySlot(slotNumber);

  if (options?.includeTransactions) {
    // Fetch transaction details based on the encoding option
    block.transactions = await Promise.all(block.transactionIds.map(async (txId) => {
      const tx = await db.getTransaction(txId);
      if (options?.transactionEncoding === 'binary') {
        tx.encoded = await tx.encode();
      }
      return tx;
    }));
  } else {
    // Just return the transaction IDs
    block.transactions = block.transactionIds.map((txId) => ({ id: txId }));
  }

  return block;
}