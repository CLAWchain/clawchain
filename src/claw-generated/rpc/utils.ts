// src/claw-generated/rpc/utils.ts

import { JSONRPCRequest, JSONRPCResponse, JSONRPCError } from './types';

export function parseJsonRpcRequest(rawRequest: string): JSONRPCRequest {
  try {
    const request = JSON.parse(rawRequest);
    if (!request.jsonrpc || request.jsonrpc !== '2.0') {
      throw new Error('Invalid JSON-RPC version');
    }
    if (!request.id) {
      throw new Error('Missing request ID');
    }
    if (!request.method) {
      throw new Error('Missing method name');
    }
    return request;
  } catch (err) {
    throw new Error(`Invalid JSON-RPC request: ${err.message}`);
  }
}

export function formatJsonRpcResponse(response: JSONRPCResponse): string {
  return JSON.stringify(response);
}

export function formatJsonRpcError(error: JSONRPCError): JSONRPCResponse {
  return {
    jsonrpc: '2.0',
    error
  };
}