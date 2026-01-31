import { parseRpcRequest, formatRpcResponse, RpcRequest, RpcResponse, RpcError } from './utils';

class JsonRpcServer {
  private methods: { [key: string]: (...args: any[]) => Promise<any> } = {};

  registerMethod(name: string, handler: (...args: any[]) => Promise<any>) {
    this.methods[name] = handler;
  }

  async handleRequest(rawRequest: string): Promise<string> {
    let request: RpcRequest;
    try {
      request = parseRpcRequest(rawRequest);
    } catch (err) {
      return formatRpcResponse(null, {
        code: RpcError.ParseError,
        message: 'Invalid JSON-RPC request',
        data: err.message,
      });
    }

    if (Array.isArray(request)) {
      // Batch request
      const responses = await Promise.all(
        request.map(async (req) => {
          try {
            const result = await this.handleSingleRequest(req);
            return result;
          } catch (err) {
            return formatRpcResponse(null, err);
          }
        })
      );
      return formatRpcResponse(responses);
    } else {
      // Single request
      try {
        const result = await this.handleSingleRequest(request);
        return formatRpcResponse(result);
      } catch (err) {
        return formatRpcResponse(null, err);
      }
    }
  }

  private async handleSingleRequest(request: RpcRequest): Promise<RpcResponse> {
    const { method, params, id } = request;
    const handler = this.methods[method];
    if (!handler) {
      throw {
        code: RpcError.MethodNotFound,
        message: `Method ${method} not found`,
      };
    }

    const result = await handler(...params);
    return { id, result };
  }
}

export { JsonRpcServer };