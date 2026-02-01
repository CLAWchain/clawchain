import { Chain } from './chain';
import { Wallet } from './wallet';
import { FaucetService } from './faucet.service';
import { VirtualMachine } from './vm/vm';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number | null;
  method: string;
  params?: any[];
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: any;
  error?: JsonRpcError;
}

interface JsonRpcError {
  code: number;
  message: string;
  data?: any;
}

class JsonRpcServer {
  private chain: Chain;
  private wallet: Wallet;
  private faucetService: FaucetService;
  private vm: VirtualMachine;
  private handlers: Record<string, (params: any[]) => Promise<any>> = {};

  constructor(
    chain: Chain,
    wallet: Wallet,
    faucetService: FaucetService,
    vm: VirtualMachine
  ) {
    this.chain = chain;
    this.wallet = wallet;
    this.faucetService = faucetService;
    this.vm = vm;

    this.registerHandler('chain_getBlockByNumber', this.chain.getBlockByNumber);
    this.registerHandler('wallet_generateKeypair', this.wallet.generateKeypair);
    this.registerHandler('faucet_requestTokens', this.faucetService.requestTokens);
    this.registerHandler('vm_executeContract', this.vm.executeContract);
  }

  registerHandler(method: string, handler: (params: any[]) => Promise<any>) {
    this.handlers[method] = handler;
  }

  async handleRequest(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    const { id, method, params = [] } = request;

    if (!this.handlers[method]) {
      return this.createErrorResponse(id, -32601, 'Method not found');
    }

    try {
      const result = await this.handlers[method](params);
      return this.createSuccessResponse(id, result);
    } catch (error) {
      return this.createErrorResponse(
        id,
        -32000,
        'Internal error',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  start() {
    // TODO: Implement server start logic
    console.log('JSON-RPC server started');
  }

  private createSuccessResponse(id: string | number | null, result: any): JsonRpcResponse {
    return {
      jsonrpc: '2.0',
      id,
      result,
    };
  }

  private createErrorResponse(
    id: string | number | null,
    code: number,
    message: string,
    data?: any
  ): JsonRpcResponse {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code,
        message,
        data,
      },
    };
  }
}

export { JsonRpcServer, JsonRpcRequest, JsonRpcResponse, JsonRpcError };