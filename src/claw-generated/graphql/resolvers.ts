import { Block, Transaction, TransactionReceipt, Event, EventParameter } from './typeDefs';

const resolvers = {
  Query: {
    getBlock: async (_, { blockNumber }, { dataSources }) => {
      const block = await dataSources.blockService.getBlock(blockNumber);
      return block;
    },
    getTransaction: async (_, { transactionHash }, { dataSources }) => {
      const transaction = await dataSources.transactionService.getTransaction(transactionHash);
      return transaction;
    },
    getEvents: async (_, { contractAddress, eventName, fromBlock, toBlock }, { dataSources }) => {
      const events = await dataSources.eventService.getEvents({
        contractAddress,
        eventName,
        fromBlock,
        toBlock,
      });
      return events;
    },
  },
  Block: {
    transactions: async (block, _, { dataSources }) => {
      const transactions = await Promise.all(
        block.transactions.map((txHash) =>
          dataSources.transactionService.getTransaction(txHash)
        )
      );
      return transactions;
    },
  },
  Transaction: {
    receipt: async (transaction, _, { dataSources }) => {
      const receipt = await dataSources.transactionService.getTransactionReceipt(
        transaction.hash
      );
      return receipt;
    },
  },
  TransactionReceipt: {
    events: async (receipt, _, { dataSources }) => {
      const events = await dataSources.eventService.getEventsByTransactionHash(
        receipt.transactionHash
      );
      return events;
    },
  },
  Event: {
    parameters: (event) => {
      return Object.entries(event.parameters).map(([name, value]) => ({
        name,
        value: value.toString(),
      }));
    },
  },
};

export default resolvers;