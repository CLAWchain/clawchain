import { RPCServer } from './rpc-server';
import { Blockchain } from './blockchain';
import { Wallet } from './wallet';
import { Transaction } from './transaction';

describe('RPCServer', () => {
  let rpcServer: RPCServer;
  let blockchain: Blockchain;
  let wallet: Wallet;
  let transactions: Transaction;

  beforeEach(() => {
    blockchain = new Blockchain();
    wallet = new Wallet();
    transactions = new Transaction(blockchain, wallet);
    rpcServer = new RPCServer(blockchain, wallet, transactions);
  });

  it('should handle a single request', async () => {
    const request = {
      method: 'getBalance',
      params: { address: '0x123' },
      id: 1
    };

    const response = await rpcServer.handleRequest(request);
    expect(response).toEqual({ result: 0, id: 1 });
  });

  it('should handle a batch request', async () => {
    const requests = [
      {
        method: 'getBalance',
        params: { address: '0x123' },
        id: 1
      },
      {
        method: 'sendTransaction',
        params: { transaction: { from: '0x123', to: '0x456', value: 100 } },
        id: 2
      }
    ];

    const responses = await rpcServer.handleRequest(requests);
    expect(responses).toEqual([
      { result: 0, id: 1 },
      { result: '0x123456', id: 2 }
    ]);
  });

  it('should handle errors', async () => {
    const request = {
      method: 'invalidMethod',
      params: {},
      id: 1
    };

    try {
      await rpcServer.handleRequest(request);
    } catch (err) {
      expect(err.message).toEqual('Method invalidMethod is not implemented');
    }
  });
});