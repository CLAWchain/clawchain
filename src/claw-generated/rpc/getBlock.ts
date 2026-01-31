import { Block } from '../block/block';
import { Chain } from '../blockchain/Chain';
import { TransactionReceipt } from '../transaction/TransactionReceipt';

export interface GetBlockParams {
  slot: number;
  includeTransactions?: boolean;
  encoding?: 'json' | 'binary';
}

export async function getBlock(params: GetBlockParams): Promise<Block | null> {
  const { slot, includeTransactions = false, encoding = 'json' } = params;
  const block = await Chain.instance.getBlockBySlot(slot);
  if (!block) {
    return null;
  }

  if (includeTransactions) {
    block.transactions = await Promise.all(block.transactionIds.map(async (txId) => {
      const tx = await Chain.instance.getTransaction(txId);
      if (tx) {
        const receipt = await Chain.instance.getTransactionReceipt(txId);
        return { ...tx, receipt: receipt as TransactionReceipt };
      }
      return null;
    }));
  }

  if (encoding === 'binary') {
    // Serialize the block to binary format
    block.serialize();
  }

  return block;
}