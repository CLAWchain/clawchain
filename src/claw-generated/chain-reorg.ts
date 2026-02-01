import { Block, Transaction } from '../blockchain/types';
import { setChainTip, setChainHeight } from './chain';
import { revertTransactions, replayTransactions } from '../blockchain/transaction-pool';

/**
 * Handles a chain reorganization event when a longer, valid chain is discovered.
 * @param newChain The new, longer chain that should become the canonical chain.
 */
export async function handleChainReorg(newChain: Block[]) {
  // 1. Detect the fork point between the current and new chains
  const forkIndex = findForkIndex(newChain);

  // 2. Revert transactions on the shorter chain
  await revertTransactions(forkIndex);

  // 3. Replay transactions on the new, longer chain
  await replayTransactions(newChain, forkIndex);

  // 4. Update the chain state to reflect the new canonical chain
  updateChainState(newChain);
}

/**
 * Finds the index of the fork point between the current and new chains.
 * @param newChain The new, longer chain that should become the canonical chain.
 * @returns The index of the fork point block.
 */
function findForkIndex(newChain: Block[]): number {
  const currentTipHeight = getChainTipHeight();
  const currentTipHash = getChainTipHash();

  for (let i = 0; i < newChain.length; i++) {
    if (newChain[i].hash === currentTipHash) {
      return i;
    }
  }

  return 0;
}

/**
 * Updates the chain state to reflect the new canonical chain.
 * @param newChain The new, longer chain that should become the canonical chain.
 */
function updateChainState(newChain: Block[]) {
  // Update the chain tip and height
  setChainTip(newChain[newChain.length - 1]);
  setChainHeight(newChain.length);

  // Update any other necessary state
  // ...
}