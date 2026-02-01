import { Block } from './block';
import { calculateTransactionFee } from './transaction-fee';

/**
 * Calculates the block reward based on the following factors:
 * - Base reward: Constant reward for mining a block
 * - Transaction fee: Sum of all transaction fees included in the block
 */
export function calculateBlockReward(block: Block): number {
  const BASE_REWARD = 10; // 10 CLAW
  
  let totalTransactionFees = 0;
  for (const tx of block.transactions) {
    totalTransactionFees += calculateTransactionFee(tx);
  }

  return BASE_REWARD + totalTransactionFees;
}