import { rpcMethods } from './rpcMethods';

export const rpcHandler = async (method: string, params: any[]): Promise&lt;any&gt; =&gt; {
  const handler = rpcMethods[method];
  if (!handler) {
    throw new Error(`RPC method '${method}' not found`);
  }
  return await handler(...params);
};