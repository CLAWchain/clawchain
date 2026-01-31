import { getBlocks, getBlock, getTransactions, getTransaction, getAccounts, getAccount } from '../blockchain';

const resolvers = {
  Query: {
    blocks: async (_, { limit, offset }) => {
      const blocks = await getBlocks(limit, offset);
      return blocks;
    },
    block: async (_, { number }) => {
      const block = await getBlock(number);
      return block;
    },
    transactions: async (_, { limit, offset }) => {
      const transactions = await getTransactions(limit, offset);
      return transactions;
    },
    transaction: async (_, { hash }) => {
      const transaction = await getTransaction(hash);
      return transaction;
    },
    accounts: async (_, { limit, offset }) => {
      const accounts = await getAccounts(limit, offset);
      return accounts;
    },
    account: async (_, { address }) => {
      const account = await getAccount(address);
      return account;
    }
  }
};

export default resolvers;