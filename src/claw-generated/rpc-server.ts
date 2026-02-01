import { parse, stringify } from 'jsonrpc-lite';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number | null;
  method: string;
  params?: any[];
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

class JsonRpcServer {
  async handleRequest(rawRequest: string): Promise<string> {
    try {
      const request = parse(rawRequest) as JsonRpcRequest;
      console.log('Received JSON-RPC request:', request);

      // Implement your RPC method handlers here
      const result = await this.handleMethod(request.method, request.params);

      const response: JsonRpcResponse = {
        jsonrpc: '2.0',
        id: request.id,
        result,
      };
      return stringify(response);
    } catch (err) {
      console.error('Error handling JSON-RPC request:', err);
      const response: JsonRpcResponse = {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32603,
          message: 'Internal error',
        },
      };
      return stringify(response);
    }
  }

  private async handleMethod(
    method: string,
    params?: any[]
  ): Promise<any> {
    switch (method) {
      case 'getBalance':
        return await this.getBalance(params);
      case 'sendTransaction':
        return await this.sendTransaction(params);
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }

  private async getBalance(params: any[]): Promise<number> {
    // Implement getBalance RPC method
    return 100;
  }

  private async sendTransaction(params: any[]): Promise<string> {
    // Implement sendTransaction RPC method
    return '0x1234567890abcdef';
  }
}

export default JsonRpcServer;