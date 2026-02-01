import { Block, Transaction, BlockchainState } from './types';

/**
 * Performs a chain reorganization when a longer, valid chain is discovered.
 * @param newChain The new, longer chain that should become the canonical chain.
 * @param currentState The current state of the blockchain.
 * @returns The updated blockchain state after the reorg.
 */
export function reorgChain(newChain: Block[], currentState: BlockchainState): BlockchainState {
  // 1. Identify the common ancestor block between the current and new chains
  const commonAncestorIndex = findCommonAncestor(currentState.chain, newChain);
  if (commonAncestorIndex === -1) {
    throw new Error('No common ancestor found between current and new chains');
  }

  // 2. Revert all blocks and transactions from the current chain after the common ancestor
  const revertedState = revertChain(currentState.chain, commonAncestorIndex + 1, currentState);

  // 3. Apply all blocks and transactions from the new chain, starting from the common ancestor
  const updatedState = applyChain(newChain, commonAncestorIndex + 1, revertedState);

  return updatedState;
}

function findCommonAncestor(currentChain: Block[], newChain: Block[]): number {
  let i = 0;
  while (i < currentChain.length && i < newChain.length && currentChain[i].hash === newChain[i].hash) {
    i++;
  }
  return i - 1;
}

function revertChain(chain: Block[], startIndex: number, currentState: BlockchainState): BlockchainState {
  const revertedState: BlockchainState = { ...currentState };
  for (let i = startIndex; i < chain.length; i++) {
    const block = chain[i];
    revertedState.transactionPool.push(...block.transactions);
    revertedState.chain.pop();
    // Revert state changes for each transaction in the block
    for (const tx of block.transactions) {
      revertTransactionState(revertedState, tx);
    }
  }
  return revertedState;
}

function applyChain(chain: Block[], startIndex: number, initialState: BlockchainState): BlockchainState {
  const updatedState: BlockchainState = { ...initialState };
  for (let i = startIndex; i < chain.length; i++) {
    const block = chain[i];
    // Apply state changes for each transaction in the block
    for (const tx of block.transactions) {
      applyTransactionState(updatedState, tx);
    }
    updatedState.chain.push(block);
    updatedState.transactionPool = updatedState.transactionPool.filter((tx) => !block.transactions.includes(tx));
  }
  return updatedState;
}

function revertTransactionState(state: BlockchainState, tx: Transaction) {
  // Restore the sender's account balance
  state.accounts[tx.from].balance += tx.amount;

  // Remove the transaction from the transaction pool
  state.transactionPool = state.transactionPool.filter((poolTx) => !poolTx.equals(tx));

  // Revert any other state changes caused by the transaction
  // (e.g., contract state, token balances, etc.)
}

function applyTransactionState(state: BlockchainState, tx: Transaction) {
  // Update the sender's account balance
  state.accounts[tx.from].balance -= tx.amount;

  // Update the recipient's account balance
  state.accounts[tx.to].balance += tx.amount;

  // Add the transaction to the transaction pool
  state.transactionPool.push(tx);

  // Apply any other state changes caused by the transaction
  // (e.g., contract state, token balances, etc.)
}