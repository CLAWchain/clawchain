import { Transaction } from '@solana/web3.js';
import { connection } from './connection';

export async function sendTransaction(base64Tx: string): Promise<string> {
  // 1. Decode the base64-encoded transaction
  const transaction = Transaction.from(Buffer.from(base64Tx, 'base64'));

  // 2. Validate the transaction
  if (!transaction.verifySignatures()) {
    throw new Error('Invalid transaction signature');
  }

  // 3. Broadcast the transaction to the network
  const txHash = await connection.sendRawTransaction(transaction.serialize());

  return txHash;
}