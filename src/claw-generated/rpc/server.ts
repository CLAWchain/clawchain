// src/claw-generated/rpc/server.ts
import { parseJsonRpcRequest, handleJsonRpcRequest } from './handler';

export class JsonRpcServer {
  async handleRequest(rawRequest: string): Promise<string> {
    try {
      const request = parseJsonRpcRequest(rawRequest);
      const response = await handleJsonRpcRequest(request);
      return JSON.stringify(response);
    } catch (err) {
      return JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal error',
        },
        id: null,
      });
    }
  }
}