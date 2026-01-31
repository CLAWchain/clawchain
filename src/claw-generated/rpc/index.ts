import { JsonRpcServer } from './server';
import { sendTransaction } from './handlers';

const server = new JsonRpcServer();

server.addMethod('sendTransaction', sendTransaction);

export default server;