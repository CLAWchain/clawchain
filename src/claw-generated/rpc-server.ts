import { PublicKey } from '@solana/web3.js';
import { getAccountInfo, GetAccountInfoResponse } from './account';

export async function handleRpcRequest(method: string, params: any[]): Promise<any> {
  switch (method) {
    case 'getAccountInfo':
      const pubkey = new PublicKey(params[0]);
      return await getAccountInfo(pubkey);
    default:
      throw new Error(`Unknown RPC method: ${method}`);
  }
}