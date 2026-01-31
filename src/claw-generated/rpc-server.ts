import { parse, stringify } from 'json-rpc-protocol';

interface RPCRequest {
  jsonrpc: '2.0';
  method: string;
  params?: any[];
  id?: number | string;
}

interface RPCResponse {
  jsonrpc: '2.0';
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id?: number | string;
}

class JSONRPCServer {
  async handleRequest(rawRequest: string): Promise<string> {
    try {
      const request: RPCRequest = parse(rawRequest);
      console.log(`Received RPC request: ${request.method}`);

      // Handle the request and generate the response
      const response: RPCResponse = {
        jsonrpc: '2.0',
        id: request.id,
        result: await this.processRequest(request)
      };

      return stringify(response);
    } catch (err) {
      console.error('Error handling RPC request:', err);
      return stringify({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal error'
        },
        id: null
      });
    }
  }

  async processRequest(request: RPCRequest): Promise<any> {
    switch (request.method) {
      case 'getBalance':
        return await this.getBalance(request.params?.[0]);
      case 'sendTransaction':
        return await this.sendTransaction(request.params?.[0]);
      default:
        throw new Error(`Method ${request.method} not found`);
    }
  }

  async getBalance(address: string): Promise<number> {
    // Implement logic to fetch the balance for the given address
    return 100;
  }

  async sendTransaction(tx: any): Promise<string> {
    // Implement logic to send the transaction
    return '0x1234567890abcdef';
  }
}

export default JSONRPCServer;