import { JsonRpcRequest, JsonRpcResponse, JsonRpcError } from './types';

class JsonRpcServer {
  private methods: Record<string, (...args: any[]) => Promise<any>> = {};

  registerMethod(name: string, handler: (...args: any[]) => Promise<any>) {
    this.methods[name] = handler;
  }

  async handleRequest(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    if (Array.isArray(request)) {
      // Handle batch request
      const responses = await Promise.all(request.map(async (req) => {
        try {
          return await this.handleSingleRequest(req);
        } catch (err) {
          return this.createErrorResponse(req.id, err);
        }
      }));
      return responses;
    } else {
      // Handle single request
      return await this.handleSingleRequest(request);
    }
  }

  private async handleSingleRequest(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    const { id, method, params } = request;
    const handler = this.methods[method];
    if (!handler) {
      return this.createErrorResponse(id, {
        code: -32601,
        message: 'Method not found'
      });
    }

    try {
      const result = await handler(...params);
      return this.createSuccessResponse(id, result);
    } catch (err) {
      return this.createErrorResponse(id, err);
    }
  }

  private createSuccessResponse(id: string | number, result: any): JsonRpcResponse {
    return {
      jsonrpc: '2.0',
      id,
      result
    };
  }

  private createErrorResponse(id: string | number, error: JsonRpcError): JsonRpcResponse {
    return {
      jsonrpc: '2.0',
      id,
      error
    };
  }
}

export default JsonRpcServer;