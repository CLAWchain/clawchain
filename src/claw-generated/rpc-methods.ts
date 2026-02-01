// claw-generated/rpc-methods.ts
import { RPCMethod } from './rpc-types';

export const rpcMethods: Record<string, RPCMethod> = {
  'claw_getBalance': async (params) => {
    const [address] = params;
    // TODO: Implement claw_getBalance method
    return 0;
  },
  'claw_sendTransaction': async (params) => {
    const [transaction] = params;
    // TODO: Implement claw_sendTransaction method
    return '0x1234567890abcdef';
  }
};