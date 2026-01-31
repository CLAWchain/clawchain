import { Block, Transaction, Account, Log } from '../types';
import { getBlock, getTransaction, getAccountInfo, sendTransaction } from '../api/rpc';

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
    getBlocks: async (_: any, { limit, offset }: { limit?: number; offset?: number }): Promise<Block[]> => {
      // Implement pagination for blocks
      throw new Error('Not implemented');
    },
    getTransactions: async (_: any, { limit, offset }: { limit?: number; offset?: number }): Promise<Transaction[]> => {
      // Implement pagination for transactions
      throw new Error('Not implemented');
    },
  },
  Mutation: {
    sendTransaction: async (
      _: any,
      { from, to, value, data }: { from: string; to: string; value: string; data?: string }
    ): Promise<Transaction> => {
      const tx = await sendTransaction(from, to, value, data);
      return tx;
    },
  },
  Transaction: {
    block: async (tx: Transaction): Promise<Block> => {
      return await getBlock(tx.block.height);
    },
    logs: async (tx: Transaction): Promise<Log[]> => {
      // Implement log retrieval
      throw new Error('Not implemented');
    },
  },
};