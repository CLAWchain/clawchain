import { Request, Response } from 'express';
import { getBlockHeight } from '../blockchain/chain';
import { handleGetTransaction } from './getTransaction';

class JsonRpcServer {
  async handleRequest(req: Request, res: Response) {
    // Parse the JSON-RPC request
    const { id, method, params, jsonrpc } = req.body;

    // Validate the request
    if (jsonrpc !== '2.0') {
      return this.sendError(res, -32600, 'Invalid Request');
    }

    // Process the request
    const result = await this.processRequest(method, params);

    // Send the response
    this.sendResponse(res, id, result);
  }

  private async processRequest(method: string, params: any) {
    switch (method) {
      case 'getBlockHeight':
        return await this.getBlockHeight();
      case 'getTransaction':
        return await this.getTransaction(params);
      default:
        throw new Error(`Method ${method} not found`);
    }
  }

  private async getBlockHeight() {
    return await getBlockHeight();
  }

  private async getTransaction(params: any) {
    const { transactionSignature } = params;
    const provider = this; // Replace with the appropriate provider
    return await handleGetTransaction(transactionSignature, provider);
  }

  private sendResponse(res: Response, id: any, result: any) {
    res.status(200).json({
      jsonrpc: '2.0',
      id,
      result
    });
  }

  private sendError(res: Response, code: number, message: string) {
    res.status(200).json({
      jsonrpc: '2.0',
      id: null,
      error: {
        code,
        message
      }
    });
  }
}

export default JsonRpcServer;