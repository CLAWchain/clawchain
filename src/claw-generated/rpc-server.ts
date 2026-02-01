import { VM } from './vm/vm';
import { Wallet } from './wallet/wallet';
import { Transaction } from './transaction';
import { TransactionProcessor } from './transaction-processor';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: any[];
  id?: string | number;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  result?: any;
  error?: JsonRpcError;
  id?: string | number;
}

interface JsonRpcError {
  code: number;
  message: string;
  data?: any;
}

class JsonRpcServer {
  private vm: VM;
  private wallet: Wallet;
  private transactionProcessor: TransactionProcessor;

  constructor(vm: VM, wallet: Wallet, transactionProcessor: TransactionProcessor) {
    this.vm = vm;
    this.wallet = wallet;
    this.transactionProcessor = transactionProcessor;
  }

  async handleRequest(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    try {
      switch (request.method) {
        case 'eth_call':
          return await this.handleEthCall(request.params);
        case 'eth_sendTransaction':
          return await this.handleEthSendTransaction(request.params);
        case 'eth_getBalance':
          return await this.handleEthGetBalance(request.params);
        default:
          return this.createErrorResponse(-32601, 'Method not found');
      }
    } catch (error) {
      return this.createErrorResponse(-32000, 'Internal error', error);
    }
  }

  async handleBatchRequest(requests: JsonRpcRequest[]): Promise<JsonRpcResponse[]> {
    return await Promise.all(requests.map(async (request) => await this.handleRequest(request)));
  }

  private async handleEthCall(params: any[]) {
    // Implement eth_call logic
    return this.createSuccessResponse({ result: '0x0' });
  }

  private async handleEthSendTransaction(params: any[]) {
    if (!params || params.length === 0 || !params[0]) {
      return this.createErrorResponse(-32602, 'Invalid params');
    }

    const { from, to, value, data, nonce, gasLimit, gasPrice, signature } = params[0];

    try {
      const transaction = new Transaction({
        from,
        to,
        value,
        data,
        nonce,
        gasLimit,
        gasPrice,
        signature,
      });

      await this.transactionProcessor.processTransaction(transaction);
      return this.createSuccessResponse({ result: transaction.hash });
    } catch (error) {
      return this.createErrorResponse(-32000, 'Error processing transaction', error);
    }
  }

  private async handleEthGetBalance(params: any[]) {
    // Implement eth_getBalance logic
    const { address } = params[0];
    const balance = await this.wallet.getBalance(address);
    return this.createSuccessResponse({ result: balance.toString(16) });
  }

  private createSuccessResponse(data: any): JsonRpcResponse {
    return {
      jsonrpc: '2.0',
      result: data.result,
      id: data.id,
    };
  }

  private createErrorResponse(code: number, message: string, data?: any): JsonRpcResponse {
    return {
      jsonrpc: '2.0',
      error: {
        code,
        message,
        data,
      },
      id: null,
    };
  }
}

export { JsonRpcServer, JsonRpcRequest, JsonRpcResponse, JsonRpcError };