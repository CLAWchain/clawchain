import { Blockchain } from './blockchain';
import { Wallet } from './wallet';
import { Transaction } from './transaction';

export class RPCServer {
  private blockchain: Blockchain;
  private wallet: Wallet;
  private transactions: Transaction;

  constructor(blockchain: Blockchain, wallet: Wallet, transactions: Transaction) {
    this.blockchain = blockchain;
    this.wallet = wallet;
    this.transactions = transactions;
  }

  async handleRequest(request: any): Promise<any> {
    // Implement JSON-RPC 2.0 request handling
    // Support for batch requests
    // Proper error handling and error codes

    // Check if the request is a batch request
    if (Array.isArray(request)) {
      // Handle batch request
      const responses = await Promise.all(request.map(async (req) => {
        try {
          return await this.handleSingleRequest(req);
        } catch (err) {
          return { error: this.formatError(err) };
        }
      }));
      return responses;
    } else {
      // Handle single request
      return await this.handleSingleRequest(request);
    }
  }

  private async handleSingleRequest(request: any): Promise<any> {
    const { method, params, id } = request;

    switch (method) {
      case 'getBalance':
        const balance = await this.wallet.getBalance(params.address);
        return { result: balance, id };
      case 'sendTransaction':
        const txHash = await this.handleSendTransaction(params.transaction);
        return { result: txHash, id };
      default:
        throw new Error(`Method ${method} is not implemented`);
    }
  }

  private async handleSendTransaction(rawTransaction: string): Promise<string> {
    // 1. Validate the signed transaction data
    const transaction = await this.transactions.parseTransaction(rawTransaction);
    await this.transactions.validateTransaction(transaction);

    // 2. Broadcast the valid transaction to the network
    const txHash = await this.blockchain.broadcastTransaction(transaction);

    // 3. Return the transaction hash
    return txHash;
  }

  private formatError(err: any): any {
    // Format the error according to JSON-RPC 2.0 specification
    return {
      code: -32603,
      message: err.message,
      data: err.stack
    };
  }
}