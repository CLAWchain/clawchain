import { Connection, GetConfirmedSignaturesForAddressOptions, PublicKey } from '@solana/web3.js';
import { RpcContext } from '../types';

export interface GetSignaturesForAddressParams {
  address: string;
  options?: {
    limit?: number;
    before?: string;
    until?: string;
  };
}

export async function getSignaturesForAddress(
  ctx: RpcContext,
  { address, options }: GetSignaturesForAddressParams
): Promise<string[]> {
  const { connection } = ctx;
  const pubkey = new PublicKey(address);

  const opts: GetConfirmedSignaturesForAddressOptions = {
    limit: options?.limit || 20,
    before: options?.before,
    until: options?.until,
  };

  try {
    const signatures = await connection.getConfirmedSignaturesForAddress2(pubkey, opts);
    return signatures.map((sig) => sig.signature);
  } catch (error) {
    console.error('Error fetching signatures:', error);
    throw error;
  }
}