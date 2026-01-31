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
  }

  type Query {
    block(height: Int!): Block
    transaction(hash: String!): Transaction
  }
`;