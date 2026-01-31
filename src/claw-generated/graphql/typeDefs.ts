import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Query {
    getBlock(blockNumber: Int!): Block
    getTransaction(transactionHash: String!): Transaction
    getEvents(
      contractAddress: String
      eventName: String
      fromBlock: Int
      toBlock: Int
    ): [Event]
  }

  type Block {
    number: Int!
    hash: String!
    parentHash: String!
    timestamp: Int!
    transactions: [Transaction!]!
  }

  type Transaction {
    hash: String!
    from: String!
    to: String!
    value: String!
    gas: Int!
    gasPrice: String!
    nonce: Int!
    input: String!
    receipt: TransactionReceipt!
  }

  type TransactionReceipt {
    transactionHash: String!
    blockNumber: Int!
    blockHash: String!
    contractAddress: String
    events: [Event!]!
  }

  type Event {
    address: String!
    name: String!
    parameters: [EventParameter!]!
  }

  type EventParameter {
    name: String!
    value: String!
  }
`;

export default typeDefs;