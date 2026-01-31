import { getBalance } from './getBalance';

export const rpcMethods = {
  getBalance,
  // other RPC methods...
};

export type RpcMethod = keyof typeof rpcMethods;

export async function dispatchRpcCall(method: RpcMethod, ...args: any[]) {
  const handler = rpcMethods[method];
  if (!handler) {
    throw new Error(`RPC method '${method}' not found`);
  }
  return await handler(...args);
}