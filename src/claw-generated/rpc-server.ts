import { VirtualMachine } from './vm2';
import { Account } from './account';
import { Transaction } from './transaction';

export class JsonRpcServer {
  private vm: VirtualMachine;
  private accounts: Account[];

  constructor(initialGas: number) {
    this.vm = new VirtualMachine(initialGas);
    this.accounts = []; // Initialize accounts
  }

  handleRequest(requestData: any): any {
    let responses = [];

    if (Array.isArray(requestData)) {
      // Batch request
      for (let request of requestData) {
        responses.push(this.handleSingleRequest(request));
      }
    } else {
      // Single request
      responses.push(this.handleSingleRequest(requestData));
    }

    return responses;
  }

  private handleSingleRequest(request: any): any {
    try {
      const { method, params, id } = request;
      switch (method) {
        case 'eth_call':
          return this.handleEthCall(params);
        case 'eth_sendTransaction':
          return this.handleSendTransaction(params);
        case 'eth_getBalance':
          return this.handleGetBalance(params);
        // Add more methods here
        default:
          return this.createErrorResponse(
            -32601,
            `Method ${method} not found`,
            id
          );
      }
    } catch (err) {
      return this.createErrorResponse(-32603, err.message, request.id);
    }
  }

  private handleEthCall(params: any): any {
    const [callParams] = params;
    const { to, data } = callParams;
    const result = this.vm.executeContract(to, new Uint8Array(Buffer.from(data.slice(2), 'hex')));
    return { result: '0x' + Buffer.from(result).toString('hex') };
  }

  private handleSendTransaction(params: any): any {
    const [txParams] = params;
    const tx = new Transaction(txParams);
    // Validate and add tx to pool
    const txHash = '0x1234567890abcdef';
    return { result: txHash };
  }

  private handleGetBalance(params: any): any {
    const [address] = params;
    const balance = this.vm.getBalance(address);
    return { result: '0x' + balance.toString(16) };
  }

  private createErrorResponse(code: number, message: string, id: any): any {
    return {
      jsonrpc: '2.0',
      error: { code, message },
      id
    };
  }
}