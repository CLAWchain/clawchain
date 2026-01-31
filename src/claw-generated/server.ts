import { parseJsonRpcRequest, JsonRpcRequest, JsonRpcResponse, JsonRpcBatchRequest, JsonRpcBatchResponse } from './types';

export class JsonRpcServer {
  private methodHandlers: Record<string, (params: any[]) => Promise<any>> = {};

  registerMethod(name: string, handler: (params: any[]) => Promise<any>) {
    this.methodHandlers[name] = handler;
  }

  async handleRequest(rawRequest: string): Promise<JsonRpcResponse | JsonRpcBatchResponse> {
    try {
      const requests = Array.isArray(JSON.parse(rawRequest))
        ? (JSON.parse(rawRequest) as JsonRpcBatchRequest)
        : [parseJsonRpcRequest(rawRequest)];

      const responses = await Promise.all(requests.map(async (request) => {
        const handler = this.methodHandlers[request.method];
        if (!handler) {
          return {
            jsonrpc: '2.0',
            id: request.id,
            error: {
              code: -32601,
              message: 'Method not found'
            }
          };
        }
        try {
          const result = await handler(request.params || []);
          return {
            jsonrpc: '2.0',
            id: request.id,
            result
          };
        } catch (err) {
          console.error('JSON-RPC error:', err);
          return {
            jsonrpc: '2.0',
            id: request.id,
            error: {
              code: -32603,
              message: 'Internal error'
            }
          };
        }
      }));

      return responses.length === 1 ? responses[0] : responses;
    } catch (err) {
      console.error('JSON-RPC error:', err);
      return {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32603,
          message: 'Internal error'
        }
      };
    }
  }
}