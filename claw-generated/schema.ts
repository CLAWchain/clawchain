import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Query {
    blocks(limit: Int, offset: Int): [Block!]!
    block(hash: String!): Block
    transactions(limit: Int, offset: Int): [Transaction!]!
    transaction(hash: String!): Transaction
  }

  type Block {
    hash: String!
    number: Int!
    timestamp: Int!
    transactions: [Transaction!]!
  }

  type Transaction {
    hash: String!
    block: Block!
    from: String!
    to: String!
    value: String!
    gas: String!
    gasPrice: String!
    nonce: Int!
  }
`;