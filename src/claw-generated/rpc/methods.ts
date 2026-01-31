import { get_balance } from './balance';
import { get_block } from './block_rpc';

export const RPC_METHODS = {
  getBalance: (pubkey: string) => {
    const balance = get_balance(pubkey);
    return { balance };
  },
  getBlock: (slot: number, options: { transactionDetails?: boolean, encoding?: 'json' | 'binary' }) => {
    const block = get_block(slot, options);
    return block;
  },
  // Other RPC methods...
};