import { Request, Response } from 'express';
import { Transaction } from '../transaction';
import { VirtualMachine } from '../vm/virtual_machine';

export class JsonRpcServer {
  private vm: VirtualMachine;

  constructor(vm: VirtualMachine) {
    this.vm = vm;
  }

  handleRequest(req: Request, res: Response) {
    // Parse the JSON-RPC request
    const { method, params, id } = req.body;

    // Validate the request
    if (!method || typeof method !== 'string') {
      return this.sendError(res, -32600, 'Invalid Request');
    }

    // Dispatch the request to the appropriate handler
    const handler = this.getHandler(method);
    if (!handler) {
      return this.sendError(res, -32601, 'Method not found');
    }

    try {
      const result = handler(params);
      this.sendResponse(res, id, result);
    } catch (err) {
      this.sendError(res, -32603, 'Internal error');
    }
  }

  private getHandler(method: string) {
    // Map the method name to a handler function
    switch (method) {
      case 'sendTransaction':
        return this.handleSendTransaction;
      case 'eth_call':
        return this.handleCall;
      // Add more method handlers here
      default:
        return null;
    }
  }

  private handleSendTransaction(params: any) {
    // Extract the signed transaction from the params
    const { signedTransaction } = params;

    // Validate the signed transaction
    const tx = Transaction.fromBase64(signedTransaction);
    if (!tx.verify()) {
      throw new Error('Invalid transaction signature');
    }

    // Execute the transaction
    this.vm.executeTransaction(tx);

    // Return the transaction hash
    return tx.hash().toString('hex');
  }

  private handleCall(params: any) {
    // Implement the logic to handle the 'eth_call' method
    // This should include executing the call and returning the result
    return '0xdeadbeef';
  }

  private sendResponse(res: Response, id: any, result: any) {
    res.json({ jsonrpc: '2.0', id, result });
  }

  private sendError(res: Response, code: number, message: string) {
    res.status(400).json({ jsonrpc: '2.0', id: null, error: { code, message } });
  }
}