export interface RpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: any[];
  id?: string | number | null;
}

export interface RpcResponse {
  jsonrpc: '2.0';
  result?: any;
  error?: RpcError;
  id?: string | number | null;
}

export interface RpcError {
  code: number;
  message: string;
  data?: any;
}

export enum RpcError {
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603,
  ServerError = -32000,
}

export function parseRpcRequest(rawRequest: string): RpcRequest {
  const request = JSON.parse(rawRequest);
  if (
    typeof request !== 'object' ||
    request === null ||
    !('jsonrpc' in request) ||
    request.jsonrpc !== '2.0'
  ) {
    throw new Error('Invalid JSON-RPC request');
  }
  return request as RpcRequest;
}

export function formatRpcResponse(
  result?: any,
  error?: RpcError
): string {
  const response: RpcResponse = {
    jsonrpc: '2.0',
    result,
    error,
  };
  return JSON.stringify(response);
}