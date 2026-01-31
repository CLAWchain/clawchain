import { parse, Response } from 'jsonrpc-lite';

export class JsonRpcServer {
  async handleRequest(requestBody: string): Promise<string> {
    try {
      const request = parse(requestBody);
      console.log('Received JSON-RPC request:', request);

      // TODO: Implement request handling
      const response: Response = {
        jsonrpc: '2.0',
        id: request.id,
        result: 'Hello, JSON-RPC!',
      };

      return JSON.stringify(response);
    } catch (error) {
      console.error('Error handling JSON-RPC request:', error);
      const response: Response = {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32603,
          message: 'Internal error',
        },
      };
      return JSON.stringify(response);
    }
  }
}