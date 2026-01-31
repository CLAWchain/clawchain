export enum JsonRpcError {
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603,
  ServerError = -32000
}

export interface JsonRpcRequest {
  id: number | string | null;
  jsonrpc: '2.0';
  method: string;
  params?: any;
}

export interface JsonRpcResponse {
  id: number | string | null;
  jsonrpc: '2.0';
  result?: any;
  error?: {
    code: JsonRpcError;
    message: string;
    data?: any;
  };
}