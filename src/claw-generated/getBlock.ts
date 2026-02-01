import { ChainStore } from '../store/ChainStore';

export async function getBlock(params: { slot: number, includeTransactions?: boolean }) {
  const { slot, includeTransactions = false } = params;
  const block = await ChainStore.getBlock(slot);

  if (!block) {
    throw new Error(`Block not found for slot ${slot}`);
  }

  const response = {
    slot: block.slot,
    timestamp: block.timestamp,
    transactions: includeTransactions ? block.transactions.map(tx => ({
      signature: tx.signature,
      // include other tx details here
    })) : undefined,
    // include other block details here
  };

  return response;
}