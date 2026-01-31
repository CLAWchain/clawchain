import { getBalance } from './getBalance';

export const getBalanceEndpoint = {
  method: 'getBalance',
  handler: async (params: { pubkey: string }) => {
    const balance = await getBalance(params.pubkey);
    return { balance };
  }
};