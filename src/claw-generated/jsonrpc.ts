import { JsonRpcRequest, JsonRpcResponse, JsonRpcError } from './types';

class JsonRpcServer {
  async handleRequest(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    try {
      const result = await this.handleMethod(request.method, request.params);
      return {
        id: request.id,
        jsonrpc: '2.0',
        result
      };
    } catch (err) {
      return this.handleError({
        code: -32603,
        message: 'Internal error',
        data: err.message
      });
    }
  }

  async handleBatchRequest(requests: JsonRpcRequest[]): Promise<JsonRpcResponse[]> {
    return await Promise.all(requests.map(async (request) => {
      return await this.handleRequest(request);
    }));
  }

  private async handleMethod(method: string, params: any): Promise<any> {
    // Dispatch to appropriate method handler
    switch (method) {
      case 'eth_sendTransaction':
        return await this.handleSendTransaction(params);
      case 'eth_call':
        return await this.handleEthCall(params);
      // Add more method handlers as needed
      default:
        throw new Error(`Method ${method} not found`);
    }
  }

  private async handleSendTransaction(params: any): Promise<any> {
    // Implement transaction sending logic
    return '0x1234567890abcdef';
  }

  private async handleEthCall(params: any): Promise<any> {
    // Implement eth_call logic
    return '0x0123456789abcdef';
  }

  private handleError(error: JsonRpcError): JsonRpcResponse {
    return {
      jsonrpc: '2.0',
      error
    };
  }
}

export default JsonRpcServer;