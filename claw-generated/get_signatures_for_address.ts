import { AccountInfo, Connection, PublicKey, SignatureInfo } from '@solana/web3.js';

export async function getSignaturesForAddress(
  connection: Connection,
  address: string,
  limit: number = 10,
  before?: string,
  until?: string
): Promise<SignatureInfo[]> {
  const publicKey = new PublicKey(address);
  const signatures = await connection.getSignaturesForAddress(
    publicKey,
    {
      limit,
      before,
      until
    }
  );
  return signatures;
}