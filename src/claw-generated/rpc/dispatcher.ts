// src/claw-generated/rpc/dispatcher.ts

import { JSONRPCRequest, JSONRPCResponse, JSONRPCError } from './types';
import { formatJsonRpcError } from './utils';

// Map of registered RPC methods
const registeredMethods: Record<string, (params: any) => Promise<any>> = {
  'claw_getBalance': getBalance,
  'claw_sendTransaction': sendTransaction
};

export async function dispatchRpcMethod(request: JSONRPCRequest): Promise<JSONRPCResponse> {
  const { method, params, id } = request;

  // Check if the method is registered
  if (!registeredMethods[method]) {
    return formatJsonRpcError({
      code: -32601,
      message: 'Method not found'
    });
  }

  try {
    // Invoke the registered method
    const result = await registeredMethods[method](params);
    return {
      jsonrpc: '2.0',
      result,
      id
    };
  } catch (err) {
    // Handle errors
    return formatJsonRpcError({
      code: -32603,
      message: 'Internal error',
      data: err.message
    });
  }
}

async function getBalance(params: any): Promise<any> {
  // Implement actual getBalance RPC method
  return '0x1234567890';
}

async function sendTransaction(params: any): Promise<any> {
  // Implement actual sendTransaction RPC method
  return '0x1234567890abcdef';
}