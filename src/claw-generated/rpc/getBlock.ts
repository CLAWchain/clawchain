import { Block } from '../block/block';

export async function getBlock(params: {
  slot: number;
  includeTransactions?: boolean;
  encoding?: 'json' | 'binary';
}): Promise&lt;Block&gt; {
  // Fetch the block data by slot number
  const block = await Block.getBySlot(params.slot);

  // Include transaction details if requested
  if (params.includeTransactions) {
    block.transactions = await Promise.all(block.transactionIds.map(
      (txId) => Transaction.getByHash(txId)
    ));
  }

  // Encode the response as requested
  if (params.encoding === 'binary') {
    return block.toBinary();
  } else {
    return block.toJSON();
  }
}