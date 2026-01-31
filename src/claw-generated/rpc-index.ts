import { handleRpcRequest } from './rpc-server';

export async function handleJsonRpcRequest(request: any): Promise<any> {
  const { method, params } = request;
  try {
    const result = await handleRpcRequest(method, params);
    return { jsonrpc: '2.0', result, id: request.id };
  } catch (err) {
    return { jsonrpc: '2.0', error: { code: -32603, message: err.message }, id: request.id };
  }
}