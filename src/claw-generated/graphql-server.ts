import { ApolloServer } from 'apollo-server';
import { resolvers } from './resolvers';
import { readFileSync } from 'fs';
import path from 'path';

const typeDefs = readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    blockchain: req.blockchain // Provide the blockchain context to the resolvers
  })
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});