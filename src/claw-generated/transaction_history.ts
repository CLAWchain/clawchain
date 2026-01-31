import { Connection, PublicKey, TransactionSignature } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');

export async function getTransactionHistory(address: string, limit: number, offset: number): Promise<TransactionSignature[]> {
  const publicKey = new PublicKey(address);
  const signatures = await connection.getSignaturesForAddress(publicKey, {
    limit,
    offset,
  });
  return signatures.map(({ signature }) => signature);
}