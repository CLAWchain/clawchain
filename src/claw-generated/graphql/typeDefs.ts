import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Block {
    height: Int!
    timestamp: String!
    hash: String!
    transactions: [Transaction!]!
  }

  type Transaction {
    hash: String!
    from: String!
    to: String!
    value: String!
    timestamp: String!
    blockHeight: Int!
  }

  type Query {
    block(height: Int!): Block
    blocks(limit: Int, offset: Int): [Block!]!
    transaction(hash: String!): Transaction
    transactions(limit: Int, offset: Int): [Transaction!]!
  }
`;