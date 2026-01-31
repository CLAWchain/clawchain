import { JsonRpcRequest, JsonRpcResponse } from './utils';
import { FaucetService } from '../services/faucet';
import { TokenService } from '../services/token';

export class JsonRpcMethods {
  constructor(
    private faucetService: FaucetService,
    private tokenService: TokenService
  ) {}

  async handleMethod(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    const { id, method, params } = request;

    switch (method) {
      case 'faucet.claim':
        const { address } = params[0] as { address: string };
        const result = await this.faucetService.claimTokens(address);
        return {
          jsonrpc: '2.0',
          id,
          result,
        };
      case 'token.balance':
        const { address: tokenAddress } = params[0] as { address: string };
        const balance = await this.tokenService.getBalance(tokenAddress);
        return {
          jsonrpc: '2.0',
          id,
          result: balance,
        };
      default:
        return {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: 'Method not found',
          },
        };
    }
  }
}