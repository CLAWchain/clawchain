import { Connection, PublicKey, TransactionSignature } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');

export async function getTransactionSignatures(
  address: string,
  limit: number,
  before?: string,
  until?: string
): Promise<TransactionSignature[]> {
  const accountInfo = await connection.getAccountInfo(new PublicKey(address));
  if (!accountInfo) {
    throw new Error(`Account not found: ${address}`);
  }

  const signatures = await connection.getSignaturesForAddress(
    new PublicKey(address),
    {
      limit,
      before,
      until,
    }
  );

  return signatures.map((sig) => sig.signature);
}