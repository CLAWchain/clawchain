import { Block, Transaction } from '../types';

export const resolvers = {
  Query: {
    blocks: async (parent, { limit, offset }, context) => {
      // Fetch blocks from the blockchain
      const blocks = await context.blockchain.getBlocks(limit, offset);
      return blocks;
    },
    transactions: async (parent, { limit, offset }, context) => {
      // Fetch transactions from the blockchain
      const transactions = await context.blockchain.getTransactions(limit, offset);
      return transactions;
    },
    block: async (parent, { number }, context) => {
      // Fetch a single block by number
      const block = await context.blockchain.getBlock(number);
      return block;
    },
    transaction: async (parent, { hash }, context) => {
      // Fetch a single transaction by hash
      const transaction = await context.blockchain.getTransaction(hash);
      return transaction;
    }
  },
  Block: {
    transactions: async (parent, args, context) => {
      // Fetch the transactions for a given block
      return parent.transactions;
    }
  },
  Transaction: {
    block: async (parent, args, context) => {
      // Fetch the block for a given transaction
      return context.blockchain.getBlock(parent.blockNumber);
    }
  }
};