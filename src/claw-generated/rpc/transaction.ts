import { Transaction } from '@solana/web3.js';
import { verifyAndBroadcastTransaction } from '../utils/transaction';

export async function sendTransaction(encodedTransaction: string): Promise&lt;string&gt; {
  // 1. Decode the base64-encoded transaction
  const transaction = Transaction.from(Buffer.from(encodedTransaction, 'base64'));

  // 2. Verify the transaction signature and broadcast to the network
  const signature = await verifyAndBroadcastTransaction(transaction);

  return signature;
}