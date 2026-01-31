import { Request } from 'express';

export interface JsonRpcRequest {
  id: number | string | null;
  method: string;
  params: any[];
  jsonrpc: '2.0';
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number | string | null;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export async function validateJsonRpcRequest(body: any): Promise<JsonRpcRequest> {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid JSON-RPC request body');
  }

  const { id, method, params, jsonrpc } = body;

  if (typeof jsonrpc !== 'string' || jsonrpc !== '2.0') {
    throw new Error('Invalid JSON-RPC version');
  }

  if (typeof method !== 'string') {
    throw new Error('Invalid JSON-RPC method');
  }

  if (!Array.isArray(params)) {
    throw new Error('Invalid JSON-RPC params');
  }

  if (typeof id !== 'number' && typeof id !== 'string' && id !== null) {
    throw new Error('Invalid JSON-RPC id');
  }

  return { id, method, params, jsonrpc };
}