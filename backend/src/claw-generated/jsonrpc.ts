import { Request, Response, Router } from 'express';
import { Chain } from '../blockchain/Chain';
import { TransactionPool } from '../blockchain/TransactionPool';
import { stateManager } from '../blockchain/StateManager';
import { ValidatorManager } from '../validators/ValidatorManager';
import { EventBus } from '../events/EventBus';

const jsonrpcRouter = Router();

interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: any[];
  id?: number | string;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id?: number | string;
}

const chain = new Chain();
const txPool = new TransactionPool();
const validatorManager = new ValidatorManager();
const eventBus = EventBus.getInstance();

jsonrpcRouter.post('/', async (req: Request, res: Response) => {
  const requests: JsonRpcRequest[] = Array.isArray(req.body) ? req.body : [req.body];
  const responses: JsonRpcResponse[] = [];

  for (const request of requests) {
    const { method, params, id } = request;
    let result;
    let error;

    try {
      switch (method) {
        case 'getBlockByNumber':
          if (!params || params.length !== 1 || typeof params[0] !== 'number') {
            error = {
              code: -32602,
              message: 'Invalid params'
            };
          } else {
            const block = chain.getBlockByHeight(params[0]);
            if (block) {
              result = block.toJSON();
            } else {
              error = {
                code: -32001,
                message: 'Block not found'
              };
            }
          }
          break;
        case 'getTransactionReceipt':
          if (!params || params.length !== 1 || typeof params[0] !== 'string') {
            error = {
              code: -32602,
              message: 'Invalid params'
            };
          } else {
            const receipt = await txPool.getTransactionReceipt(params[0]);
            if (receipt) {
              result = receipt.toJSON();
            } else {
              error = {
                code: -32001,
                message: 'Transaction not found'
              };
            }
          }
          break;
        case 'getBalance':
          if (!params || params.length !== 1 || typeof params[0] !== 'string') {
            error = {
              code: -32602,
              message: 'Invalid params'
            };
          } else {
            const balance = stateManager.getBalance(params[0]);
            result = {
              address: params[0],
              balance: stateManager.formatBalance(balance),
              balanceRaw: balance.toString()
            };
          }
          break;
        case 'sendTransaction':
          if (!params || params.length !== 1 || typeof params[0] !== 'object') {
            error = {
              code: -32602,
              message: 'Invalid params'
            };
          } else {
            const { from, to, value, gasPrice, gasLimit, nonce, data, signature } = params[0];
            const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
            const txHash = Array.from({ length: 44 }, () => BASE58[Math.floor(Math.random() * 58)]).join('');

            const tx = {
              hash: txHash,
              from,
              to,
              value: BigInt(value),
              gasPrice: BigInt(gasPrice),
              gasLimit: BigInt(gasLimit),
              nonce,
              data,
              signature
            };

            const added = await txPool.addTransaction(tx);
            if (added) {
              eventBus.emit('transaction_added', tx);
              result = { hash: tx.hash };
            } else {
              error = {
                code: -32000,
                message: 'Invalid transaction'
              };
            }
          }
          break;
        default:
          error = {
            code: -32601,
            message: 'Method not found'
          };
      }
    } catch (err) {
      error = {
        code: -32603,
        message: 'Internal error',
        data: (err as Error).message
      };
    }

    const response: JsonRpcResponse = {
      jsonrpc: '2.0',
      id: id,
      result: result,
      error: error
    };
    responses.push(response);
  }

  res.json(responses);
});

export { jsonrpcRouter };