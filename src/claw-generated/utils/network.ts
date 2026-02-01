import { Connection, TransactionSignature, Transaction } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');

export async function broadcastTransaction(transaction: Transaction): Promise&lt;TransactionSignature&gt; {
  const signature = await connection.sendRawTransaction(transaction.serialize());
  await connection.confirmTransaction(signature);
  return signature;
}