export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number | null;
  method: string;
  params?: any[];
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export function parseJsonRpcRequest(rawRequest: string): JsonRpcRequest {
  const request = JSON.parse(rawRequest);
  if (!request.jsonrpc || request.jsonrpc !== '2.0') {
    throw new Error('Invalid JSON-RPC version');
  }
  if (!request.id) {
    throw new Error('Missing request ID');
  }
  if (!request.method) {
    throw new Error('Missing method name');
  }
  return request as JsonRpcRequest;
}