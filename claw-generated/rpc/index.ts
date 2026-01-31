import JsonRpcServer from './server';
import { JsonRpcRequest, JsonRpcResponse } from './types';

const rpcServer = new JsonRpcServer();

// Register RPC methods here
rpcServer.registerMethod('getBalance', async (address: string) => {
  // Implement getBalance RPC method
  return 100;
});

export async function handleRpcRequest(request: JsonRpcRequest): Promise<JsonRpcResponse> {
  return await rpcServer.handleRequest(request);
}