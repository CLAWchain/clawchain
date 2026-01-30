import { Block, Transaction } from '../types';
import { getBlock as dbGetBlock, getTransaction as dbGetTransaction } from '../db';

export async function getBlock(slot: number, includeTransactionDetails: boolean = false, encoding: 'json' | 'base64' = 'json'): Promise<Block | null> {
  const block = await dbGetBlock(slot);
  if (!block) {
    return null;
  }

  if (includeTransactionDetails) {
    block.transactions = await Promise.all(block.transactions.map(async (txSignature) => {
      const tx = await dbGetTransaction(txSignature);
      return tx;
    }));
  }

  if (encoding === 'base64') {
    block.data = Buffer.from(JSON.stringify(block)).toString('base64');
  }

  return block;
}