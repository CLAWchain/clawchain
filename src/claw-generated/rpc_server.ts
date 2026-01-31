import { RPCHandler } from './rpc_handler';
import { TransactionStorage } from './transaction_storage';

export class RPCServer {
  private rpcHandler: RPCHandler;

  constructor() {
    const transactionStorage = new TransactionStorage();
    this.rpcHandler = new RPCHandler(transactionStorage);
  }

  async handleRequest(method: string, params: any): Promise<any> {
    switch (method) {
      case 'getSignaturesForAddress':
        const { address, limit, offset } = params;
        return await this.rpcHandler.getSignaturesForAddress(address, limit, offset);
      default:
        throw new Error(`Unknown RPC method: ${method}`);
    }
  }
}