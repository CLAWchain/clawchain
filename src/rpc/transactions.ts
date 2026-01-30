import { TransactionsDb } from "../state/transactions_db";

const transactionsDb = new TransactionsDb();

export interface GetSignaturesForAddressParams {
  address: Uint8Array;
  limit?: number;
  before?: Uint8Array;
  until?: Uint8Array;
}

export interface SignatureInfo {
  signature: Uint8Array;
  slot: number;
  blockTime: number;
}

export async function getSignaturesForAddress(params: GetSignaturesForAddressParams): Promise<SignatureInfo[]> {
  const { address, limit = 20, before, until } = params;
  const signatures = await transactionsDb.getSignaturesForAddress(address, { limit, before, until });
  return signatures.map(({ signature, slot, blockTime }) => ({
    signature,
    slot,
    blockTime
  }));
}

export const rpcHandlers = {
  getSignaturesForAddress
};