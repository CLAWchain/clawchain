export interface JsonRpcRequest {
  id?: number | string;
  jsonrpc: '2.0';
  method: string;
  params?: any;
}

export interface JsonRpcResponse {
  id?: number | string;
  jsonrpc: '2.0';
  result?: any;
  error?: JsonRpcError;
}

export interface JsonRpcError {
  code: number;
  message: string;
  data?: any;
}