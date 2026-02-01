import { getBlock } from './get_block';
import { RpcRequest, RpcResponse } from '../types/rpc';

const rpcMethods: Record&lt;string, (request: RpcRequest) => Promise&lt;RpcResponse&gt;&gt; = {
  getBlock
};

export async function handleRpcRequest(request: RpcRequest): Promise&lt;RpcResponse&gt; {
  const { method } = request;
  const handler = rpcMethods[method];

  if (!handler) {
    return {
      error: {
        code: -32601,
        message: 'Method not found'
      },
      id: request.id,
      jsonrpc: '2.0'
    };
  }

  try {
    const response = await handler(request);
    return response;
  } catch (error) {
    console.error('RPC error:', error);
    return {
      error: {
        code: -32603,
        message: 'Internal error'
      },
      id: request.id,
      jsonrpc: '2.0'
    };
  }
}