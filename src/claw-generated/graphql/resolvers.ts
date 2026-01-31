import { IResolvers } from '@graphql-tools/utils';
import { Block, Transaction } from './typeDefs';
import { getBlock, getBlocks, getTransaction, getTransactions } from '../chain';

export const resolvers: IResolvers = {
  Query: {
    block: (_: any, { height }: { height: number }): Block => {
      const block = getBlock(height);
      return {
        height: block.height,
        timestamp: block.timestamp.toString(),
        hash: block.hash,
        transactions: block.transactions.map((tx) => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value.toString(),
          timestamp: tx.timestamp.toString(),
          blockHeight: block.height,
        })),
      };
    },
    blocks: (_: any, { limit, offset }: { limit?: number; offset?: number }): Block[] => {
      const blocks = getBlocks(limit, offset);
      return blocks.map((block) => ({
        height: block.height,
        timestamp: block.timestamp.toString(),
        hash: block.hash,
        transactions: block.transactions.map((tx) => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value.toString(),
          timestamp: tx.timestamp.toString(),
          blockHeight: block.height,
        })),
      }));
    },
    transaction: (_: any, { hash }: { hash: string }): Transaction => {
      const tx = getTransaction(hash);
      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value.toString(),
        timestamp: tx.timestamp.toString(),
        blockHeight: tx.blockHeight,
      };
    },
    transactions: (_: any, { limit, offset }: { limit?: number; offset?: number }): Transaction[] => {
      const transactions = getTransactions(limit, offset);
      return transactions.map((tx) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value.toString(),
        timestamp: tx.timestamp.toString(),
        blockHeight: tx.blockHeight,
      }));
    },
  },
};