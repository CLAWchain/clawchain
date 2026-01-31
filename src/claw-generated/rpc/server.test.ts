// src/claw-generated/rpc/server.test.ts
import { JsonRpcServer } from './server';
import { JsonRpcRequest, JsonRpcResponse, JsonRpcBatchRequest, JsonRpcBatchResponse } from './types';

describe('JsonRpcServer', () => {
  let server: JsonRpcServer;

  beforeEach(() => {
    server = new JsonRpcServer();
  });

  it('should handle a single JSON-RPC request', async () => {
    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      method: 'eth_sendTransaction',
      params: [
        {
          from: '0x1234567890abcdef',
          to: '0x0987654321fedcba',
          value: '0x1234',
        },
      ],
      id: 1,
    };

    const response = await server.handleRequest(JSON.stringify(request));
    const parsedResponse: JsonRpcResponse = JSON.parse(response);

    expect(parsedResponse.jsonrpc).toEqual('2.0');
    expect(parsedResponse.result).toEqual('0x1234567890abcdef');
    expect(parsedResponse.id).toEqual(1);
  });

  it('should handle a JSON-RPC batch request', async () => {
    const batchRequest: JsonRpcBatchRequest = [
      {
        jsonrpc: '2.0',
        method: 'eth_sendTransaction',
        params: [
          {
            from: '0x1234567890abcdef',
            to: '0x0987654321fedcba',
            value: '0x1234',
          },
        ],
        id: 1,
      },
      {
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [
          {
            to: '0x0987654321fedcba',
            data: '0x0123456789abcdef',
          },
        ],
        id: 2,
      },
    ];

    const response = await server.handleRequest(JSON.stringify(batchRequest));
    const parsedResponse: JsonRpcBatchResponse = JSON.parse(response);

    expect(parsedResponse).toHaveLength(2);
    expect(parsedResponse[0].jsonrpc).toEqual('2.0');
    expect(parsedResponse[0].result).toEqual('0x1234567890abcdef');
    expect(parsedResponse[0].id).toEqual(1);
    expect(parsedResponse[1].jsonrpc).toEqual('2.0');
    expect(parsedResponse[1].result).toEqual('0x0123456789abcdef');
    expect(parsedResponse[1].id).toEqual(2);
  });

  it('should handle errors', async () => {
    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      method: 'unknown_method',
      params: [],
      id: 1,
    };

    const response = await server.handleRequest(JSON.stringify(request));
    const parsedResponse: JsonRpcResponse = JSON.parse(response);

    expect(parsedResponse.jsonrpc).toEqual('2.0');
    expect(parsedResponse.error).toEqual({
      code: -32603,
      message: 'Internal error',
    });
    expect(parsedResponse.id).toEqual(1);
  });
});