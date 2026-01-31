import { Block, Transaction, Account } from '../types';
import { getBlock, getTransaction, getAccountInfo } from '../api/rpc';

export const resolvers = {
  Query: {
    getBlock: async (_: any, { height }: { height: number }): Promise<Block> => {
      const block = await getBlock(height);
      return block;
    },
    getTransaction: async (_: any, { hash }: { hash: string }): Promise<Transaction> => {
      const tx = await getTransaction(hash);
      return tx;
    },
    getAccount: async (_: any, { address }: { address: string }): Promise<Account> => {
      const accountInfo = await getAccountInfo(address);
      return {
        address,
        balance: accountInfo.balance.toString(),
        transactions: accountInfo.transactions,
      };
    },
  },
};