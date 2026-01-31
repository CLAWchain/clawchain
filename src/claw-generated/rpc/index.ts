// src/claw-generated/rpc/index.ts

import { parseJsonRpcRequest, formatJsonRpcResponse } from './utils';
import { dispatchRpcMethod } from './dispatcher';

export async function handleJsonRpcRequest(rawRequest: string): Promise<string> {
  try {
    const request = parseJsonRpcRequest(rawRequest);
    const response = await dispatchRpcMethod(request);
    return formatJsonRpcResponse(response);
  } catch (err) {
    return formatJsonRpcResponse({
      error: {
        code: -32603,
        message: 'Internal error',
        data: err.message
      }
    });
  }
}