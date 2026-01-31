import { TransactionSignature } from '@solana/web3.js';
import { Transaction, TransactionMetadata } from '../blockchain/transaction';
import { TransactionPool } from '../blockchain/transaction-pool';
import { BlockStore } from '../blockchain/block-store';

export class RPCServer {
  private transactionPool: TransactionPool;
  private blockStore: BlockStore;

  constructor(transactionPool: TransactionPool, blockStore: BlockStore) {
    this.transactionPool = transactionPool;
    this.blockStore = blockStore;
  }

  async getTransaction(signature: TransactionSignature): Promise<Transaction | null> {
    // Look up the transaction in the transaction pool
    const transaction = this.transactionPool.getTransaction(signature);
    if (transaction) {
      return transaction;
    }

    // Look up the transaction in the block store
    const block = await this.blockStore.getBlockContainingTransaction(signature);
    if (block) {
      const transaction = block.transactions.find((tx) => tx.signature === signature);
      if (transaction) {
        return transaction;
      }
    }

    // Transaction not found
    return null;
  }
}