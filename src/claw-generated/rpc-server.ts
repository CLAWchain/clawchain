import { parse, Response, Request, Batch } from 'jsonrpc-lite';
import { getBalance, sendTransaction, getTransactionReceipt, getBlockByNumber } from './rpc-handlers';

export class JsonRpcServer {
  async handleRequest(rawRequest: string): Promise<string> {
    try {
      const request = parse(rawRequest);
      let response: Response;

      if (Array.isArray(request)) {
        // Handle batch request
        response = await this.handleBatchRequest(request as Batch);
      } else {
        // Handle single request
        response = await this.handleSingleRequest(request as Request);
      }

      return JSON.stringify(response);
    } catch (err) {
      // Handle errors
      return JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal error'
        },
        id: null
      });
    }
  }

  private async handleBatchRequest(batch: Batch): Promise<Response[]> {
    return await Promise.all(batch.map(async (req) => {
      return await this.handleSingleRequest(req);
    }));
  }

  private async handleSingleRequest(request: Request): Promise<Response> {
    switch (request.method) {
      case 'getBalance':
        return await getBalance(request.params);
      case 'sendTransaction':
        return await sendTransaction(request.params);
      case 'getTransactionReceipt':
        return await getTransactionReceipt(request.params);
      case 'getBlockByNumber':
        return await getBlockByNumber(request.params);
      default:
        return {
          jsonrpc: '2.0',
          error: {
            code: -32601,
            message: 'Method not found'
          },
          id: request.id
        };
    }
  }
}