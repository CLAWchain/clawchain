import { IResolvers } from '@graphql-tools/utils';
import { Block, Transaction } from './typeDefs';
import { getBlock, getTransaction } from '../../../src/chain';

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
        })),
      };
    },
    transaction: (_: any, { hash }: { hash: string }): Transaction => {
      const tx = getTransaction(hash);
      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value.toString(),
        timestamp: tx.timestamp.toString(),
      };
    },
  },
};