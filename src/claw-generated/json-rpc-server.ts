import { Request, Response } from 'express';

export class JsonRpcServer {
  async handleRequest(req: Request, res: Response) {
    try {
      // Parse the JSON-RPC request
      const { id, method, params, jsonrpc } = req.body;

      // Handle batch requests
      if (Array.isArray(req.body)) {
        const responses = await Promise.all(req.body.map(this.handleSingleRequest));
        res.json(responses);
      } else {
        const response = await this.handleSingleRequest(req.body);
        res.json(response);
      }
    } catch (err) {
      // Handle errors
      console.error('JSON-RPC error:', err);
      res.status(500).json({
        error: {
          code: -32603,
          message: 'Internal error'
        },
        jsonrpc: '2.0',
        id: null
      });
    }
  }

  private async handleSingleRequest(request: any) {
    // Validate the request
    if (!request.id || !request.method || !request.jsonrpc) {
      return {
        error: {
          code: -32600,
          message: 'Invalid Request'
        },
        jsonrpc: '2.0',
        id: null
      };
    }

    // Call the appropriate method
    switch (request.method) {
      case 'eth_accounts':
        return this.handleEthAccounts(request);
      case 'eth_sendTransaction':
        return this.handleEthSendTransaction(request);
      // Add more methods here
      default:
        return {
          error: {
            code: -32601,
            message: 'Method not found'
          },
          jsonrpc: '2.0',
          id: request.id
        };
    }
  }

  private async handleEthAccounts(request: any) {
    // Implement the eth_accounts method
    return {
      result: ['0x1234567890123456789012345678901234567890'],
      jsonrpc: '2.0',
      id: request.id
    };
  }

  private async handleEthSendTransaction(request: any) {
    // Implement the eth_sendTransaction method
    return {
      result: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      jsonrpc: '2.0',
      id: request.id
    };
  }
}
```