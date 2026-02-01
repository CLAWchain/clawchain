import { ApolloServer, gql } from 'apollo-server-express';
import { Blockchain } from '../blockchain/blockchain';
import { Block } from '../blockchain/block';
import { Transaction } from '../transaction/transaction';

// Define the GraphQL schema
const typeDefs = gql`
  type Query {
    block(height: Int!): Block
    blocks(limit: Int, offset: Int): [Block!]!
    transaction(hash: String!): Transaction
    transactions(limit: Int, offset: Int): [Transaction!]!
  }

  type Block {
    height: Int!
    hash: String!
    timestamp: Int!
    transactions: [Transaction!]!
  }

  type Transaction {
    hash: String!
    blockHeight: Int!
    timestamp: Int!
    from: String!
    to: String!
    value: Int!
    data: String
  }
`;

// Define the GraphQL resolvers
const resolvers = {
  Query: {
    block: async (_, { height }, { dataSources }) => {
      const blockchain = dataSources.blockchain as Blockchain;
      return await blockchain.getBlock(height);
    },
    blocks: async (_, { limit, offset }, { dataSources }) => {
      const blockchain = dataSources.blockchain as Blockchain;
      return await blockchain.getBlocks(limit, offset);
    },
    transaction: async (_, { hash }, { dataSources }) => {
      const blockchain = dataSources.blockchain as Blockchain;
      return await blockchain.getTransaction(hash);
    },
    transactions: async (_, { limit, offset }, { dataSources }) => {
      const blockchain = dataSources.blockchain as Blockchain;
      return await blockchain.getTransactions(limit, offset);
    }
  }
};

// Create the GraphQL server
export const graphqlServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => ({
    dataSources: {
      blockchain: new Blockchain()
    }
  })
});