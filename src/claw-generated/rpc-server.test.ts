import { JsonRpcServer, JsonRpcRequest, JsonRpcResponse } from './rpc-server';
import { VM } from './vm/vm';
import { Wallet } from './wallet/wallet';

describe('JsonRpcServer', () => {
  let rpcServer: JsonRpcServer;
  let vm: VM;
  let wallet: Wallet;

  beforeEach(() => {
    vm = new VM(new Uint8Array(1024));
    wallet = new Wallet();
    rpcServer = new JsonRpcServer(vm, wallet);
  });

  describe('handleRequest', () => {
    it('should handle eth_call requests', async () => {
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{ to: '0x1234567890abcdef', data: '0x12345678' }],
        id: '1',
      };

      const response = await rpcServer.handleRequest(request);
      expect(response).toEqual({
        jsonrpc: '2.0',
        result: '0x0',
        id: '1',
      });
    });

    it('should handle eth_sendTransaction requests', async () => {
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        method: 'eth_sendTransaction',
        params: [{ from: '0x1234567890abcdef', to: '0x0987654321fedcba', value: '0x1000' }],
        id: '2',
      };

      const response = await rpcServer.handleRequest(request);
      expect(response).toEqual({
        jsonrpc: '2.0',
        result: '0x1234567890abcdef',
        id: '2',
      });
    });

    it('should handle eth_getBalance requests', async () => {
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [{ address: '0x1234567890abcdef' }],
        id: '3',
      };

      const response = await rpcServer.handleRequest(request);
      expect(response).toEqual({
        jsonrpc: '2.0',
        result: '0x0',
        id: '3',
      });
    });

    it('should return an error response for unknown methods', async () => {
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        method: 'unknown_method',
        params: [],
        id: '4',
      };

      const response = await rpcServer.handleRequest(request);
      expect(response).toEqual({
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: 'Method not found',
        },
        id: null,
      });
    });
  });

  describe('handleBatchRequest', () => {
    it('should handle batch requests', async () => {
      const requests: JsonRpcRequest[] = [
        {
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{ to: '0x1234567890abcdef', data: '0x12345678' }],
          id: '1',
        },
        {
          jsonrpc: '2.0',
          method: 'eth_sendTransaction',
          params: [{ from: '0x1234567890abcdef', to: '0x0987654321fedcba', value: '0x1000' }],
          id: '2',
        },
        {
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [{ address: '0x1234567890abcdef' }],
          id: '3',
        },
      ];

      const responses = await rpcServer.handleBatchRequest(requests);
      expect(responses).toEqual([
        {
          jsonrpc: '2.0',
          result: '0x0',
          id: '1',
        },
        {
          jsonrpc: '2.0',
          result: '0x1234567890abcdef',
          id: '2',
        },
        {
          jsonrpc: '2.0',
          result: '0x0',
          id: '3',
        },
      ]);
    });
  });
});