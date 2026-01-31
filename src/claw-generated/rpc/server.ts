import { JsonRpcServer } from './JsonRpcServer';
import { accountState } from '../state/account';
import { PublicKey } from '@solana/web3.js';

const server = new JsonRpcServer();

server.registerMethod('getBalance', async (params: { pubkey: string }) => {
  const { pubkey } = params;
  const account = accountState.getAccount(new PublicKey(pubkey));
  if (account) {
    return { lamports: account.getBalance() };
  } else {
    return { lamports: 0 };
  }
});

server.start();