import { RPCMethod, RPCRequest, RPCResponse } from './types';
import { getAccountBalance } from '../db/state';

const rpcMethods: Record<string, RPCMethod> = {
  getBalance: async (params: { pubkey: string }): Promise<{ balance: number }> => {
    const { pubkey } = params;
    const balance = await getAccountBalance(pubkey);
    return { balance };
  },
};

export async function handleRPCRequest(request: RPCRequest): Promise<RPCResponse> {
  const { method, params } = request;
  const handler = rpcMethods[method];
  if (!handler) {
    return {
      error: {
        code: -32601,
        message: 'Method not found',
      },
    };
  }

  try {
    const result = await handler(params);
    return { result };
  } catch (err) {
    console.error('Error handling RPC request:', err);
    return {
      error: {
        code: -32603,
        message: 'Internal error',
      },
    };
  }
}