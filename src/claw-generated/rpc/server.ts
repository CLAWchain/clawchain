import { JsonRpcRequest, JsonRpcResponse, JsonRpcError } from './types';

class JsonRpcServer {
  private readonly handlers: Record<string, (params: any) => Promise<any>> = {};

  registerHandler(method: string, handler: (params: any) => Promise<any>) {
    this.handlers[method] = handler;
  }

  async handleRequest(request: JsonRpcRequest): Promise<JsonRpcResponse | JsonRpcResponse[]> {
    if (Array.isArray(request)) {
      // Handle batch requests
      const responses = await Promise.all(request.map(async (req) => await this.handleSingleRequest(req)));
      return responses;
    } else {
      // Handle single request
      return await this.handleSingleRequest(request);
    }
  }

  private async handleSingleRequest(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    const { id, method, params } = request;

    if (!this.handlers[method]) {
      return {
        id,
        error: {
          code: JsonRpcError.MethodNotFound,
          message: `Method "${method}" not found.`
        }
      };
    }

    try {
      const result = await this.handlers[method](params);
      return { id, result };
    } catch (error) {
      return {
        id,
        error: {
          code: JsonRpcError.InternalError,
          message: error.message
        }
      };
    }
  }
}

export default JsonRpcServer;