import { Block, Transaction, Account } from '../claw-generated';

const resolvers = {
  Query: {
    getBlock: async (_, { index }) => {
      // Fetch the block by index from the blockchain
      const block = await Block.getByIndex(index);
      return block;
    },
    getBlocks: async (_, { limit = 10, offset = 0 }) => {
      // Fetch a paginated list of blocks
      const blocks = await Block.getRange(limit, offset);
      return blocks;
    },
    getTransaction: async (_, { hash }) => {
      // Fetch a transaction by hash
      const transaction = await Transaction.getByHash(hash);
      return transaction;
    },
    getTransactions: async (_, { blockIndex, limit = 10, offset = 0 }) => {
      // Fetch a paginated list of transactions, optionally filtered by block index
      const transactions = await Transaction.getRange(blockIndex, limit, offset);
      return transactions;
    },
    getAccount: async (_, { address }) => {
      // Fetch an account by address
      const account = await Account.getByAddress(address);
      return account;
    }
  },
  Mutation: {
    sendTransaction: async (_, { from, to, amount, nonce, signature }) => {
      // Create and validate a new transaction
      const transaction = new Transaction(from, to, amount, nonce, signature);
      if (transaction.validate()) {
        // Add the transaction to the transaction pool
        await Transaction.add(transaction);
        return transaction;
      } else {
        throw new Error('Invalid transaction');
      }
    }
  }
};

export default resolvers;