import { Request, Response } from 'express';
import { Transaction } from '../transaction';
import { VirtualMachine } from '../vm/virtual_machine';
import { AccountState } from '../state/account';
import { Block } from '../block';

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
      case 'getBalance':
        return this.handleGetBalance;
      case 'getBlock':
        return this.handleGetBlock;
      default:
        return null;
    }
  }

  private handleGetBlock(params: any) {
    // Extract the slot number from the params
    const { slot } = params;

    // Fetch the block by slot number
    const block = this.vm.getBlockBySlot(slot);
    if (!block) {
      throw new Error(`Block not found for slot ${slot}`);
    }

    // Optionally include transaction details
    const { includeTransactions = false } = params;
    const blockResponse = {
      slot: block.slot,
      timestamp: block.timestamp,
      parentSlot: block.parentSlot,
      transactions: includeTransactions ? block.transactions.map((tx) => tx.toJSON()) : undefined,
    };

    // Optionally encode the block data
    const { encoding = 'json' } = params;
    if (encoding === 'base64') {
      return Block.toBase64(block);
    } else {
      return blockResponse;
    }
  }

  private handleSendTransaction(params: any) {
    // ... (existing implementation)
  }

  private handleCall(params: any) {
    // ... (existing implementation)
  }

  private handleGetBalance(params: any) {
    // ... (existing implementation)
  }

  private sendResponse(res: Response, id: any, result: any) {
    res.json({ jsonrpc: '2.0', id, result });
  }

  private sendError(res: Response, code: number, message: string) {
    res.status(400).json({ jsonrpc: '2.0', id: null, error: { code, message } });
  }
}