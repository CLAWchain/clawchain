import { Connection, PublicKey, AccountInfo as SolanaAccountInfo } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');

export interface AccountInfo {
  pubkey: string;
  lamports: number;
  owner: string;
  executable: boolean;
}

export const getAccount = async (pubkey: string): Promise<AccountInfo> => {
  const accountInfo = await connection.getAccountInfo(new PublicKey(pubkey));
  if (!accountInfo) {
    throw new Error('Account not found');
  }

  return {
    pubkey,
    lamports: accountInfo.lamports,
    owner: accountInfo.owner.toBase58(),
    executable: accountInfo.executable
  };
};