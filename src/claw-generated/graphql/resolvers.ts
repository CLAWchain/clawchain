import { Block, Event, Transaction, TransactionReceipt } from './typeDefs';
import { getBlock, getTransaction, getEvents } from '../rpc';

export const resolvers = {
  Query: {
    getBlock: async (_: any, { blockNumber }: { blockNumber: number }): Promise<Block> => {
      const block = await getBlock(blockNumber);
      return {
        number: block.number,
        hash: block.hash,
        parentHash: block.parentHash,
        timestamp: block.timestamp,
        transactions: block.transactions.map((tx) => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value.toString(),
          gas: tx.gas,
          gasPrice: tx.gasPrice.toString(),
          nonce: tx.nonce,
          input: tx.input,
          receipt: {
            transactionHash: tx.hash,
            blockNumber: block.number,
            blockHash: block.hash,
            contractAddress: tx.contractAddress,
            events: [],
          },
        })),
      };
    },
    getTransaction: async (_: any, { transactionHash }: { transactionHash: string }): Promise<Transaction> => {
      const tx = await getTransaction(transactionHash);
      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value.toString(),
        gas: tx.gas,
        gasPrice: tx.gasPrice.toString(),
        nonce: tx.nonce,
        input: tx.input,
        receipt: {
          transactionHash: tx.hash,
          blockNumber: tx.blockNumber,
          blockHash: tx.blockHash,
          contractAddress: tx.contractAddress,
          events: [],
        },
      };
    },
    getEvents: async (
      _: any,
      { contractAddress, eventName, fromBlock, toBlock }: { contractAddress?: string; eventName?: string; fromBlock?: number; toBlock?: number }
    ): Promise<Event[]> => {
      const events = await getEvents(contractAddress, eventName, fromBlock, toBlock);
      return events.map((event) => ({
        address: event.address,
        name: event.name,
        parameters: event.parameters.map((param) => ({
          name: param.name,
          value: param.value,
        })),
      }));
    },
  },
};