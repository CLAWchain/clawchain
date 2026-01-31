import { get_balance } from './balance';

export const RPC_METHODS = {
  getBalance: (pubkey: string) => {
    const balance = get_balance(pubkey);
    return { balance };
  },
  // Other RPC methods...
};