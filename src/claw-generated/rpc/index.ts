import { Request, Response } from 'express';
import { validateJsonRpcRequest, JsonRpcResponse } from './utils';
import { JsonRpcMethods } from './methods';
import { FaucetService } from '../services/faucet';
import { TokenService } from '../services/token';
import { Blockchain } from '../blockchain';

export class JsonRpcServer {
  private rpcMethods: JsonRpcMethods;

  constructor(
    private faucetService: FaucetService,
    private tokenService: TokenService,
    private blockchain: Blockchain
  ) {
    this.rpcMethods = new JsonRpcMethods(faucetService, tokenService, blockchain);
  }

  async handleRequest(req: Request, res: Response) {
    try {
      const { id, method, params, jsonrpc } = await validateJsonRpcRequest(req.body);
      const response = await this.rpcMethods.handleMethod({ id, method, params, jsonrpc });
      res.json(response);
    } catch (err) {
      console.error('JSON-RPC error:', err);
      res.status(400).json({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32603,
          message: 'Internal error',
        },
      });
    }
  }
}