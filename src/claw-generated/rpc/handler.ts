// src/claw-generated/rpc/handler.ts
import { JsonRpcRequest, JsonRpcResponse, JsonRpcBatchRequest, JsonRpcBatchResponse } from './types';

export function parseJsonRpcRequest(rawRequest: string): JsonRpcRequest | JsonRpcBatchRequest {
  // Parse the JSON-RPC request from the raw string
  const request = JSON.parse(rawRequest);

  if (Array.isArray(request)) {
    return request as JsonRpcBatchRequest;
  } else {
    return request as JsonRpcRequest;
  }
}

export async function handleJsonRpcRequest(request: JsonRpcRequest | JsonRpcBatchRequest): Promise<JsonRpcResponse | JsonRpcBatchResponse> {
  if (Array.isArray(request)) {
    // Handle batch request
    const batchResponse: JsonRpcResponse[] = await Promise.all(request.map(async (item) => {
      try {
        return await dispatchRpcMethod(item.method, item.params);
      } catch (err) {
        return {
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal error',
          },
          id: item.id,
        };
      }
    }));
    return batchResponse;
  } else {
    // Handle single request
    try {
      const result = await dispatchRpcMethod(request.method, request.params);
      const response: JsonRpcResponse = {
        jsonrpc: '2.0',
        result,
        id: request.id,
      };
      return response;
    } catch (err) {
      return {
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal error',
        },
        id: request.id,
      };
    }
  }
}

function dispatchRpcMethod(method: string, params: any): Promise<any> {
  // Look up the appropriate handler function for the requested method
  // and call it with the provided params
  switch (method) {
    case 'eth_sendTransaction':
      return handleSendTransaction(params);
    case 'eth_call':
      return handleEthCall(params);
    // Add more RPC method handlers here
    default:
      throw new Error(`Unknown RPC method: ${method}`);
  }
}

function handleSendTransaction(params: any): Promise<string> {
  // Implement the logic to handle the 'eth_sendTransaction' method
  return Promise.resolve('0x1234567890abcdef');
}

function handleEthCall(params: any): Promise<string> {
  // Implement the logic to handle the 'eth_call' method
  return Promise.resolve('0x0123456789abcdef');
}