import { Keypair, Transaction, TransactionSignature } from '@solana/web3.js';
import { validateTransactionSignature } from './signature';
import { broadcastTransaction } from './network';

export async function verifyAndBroadcastTransaction(transaction: Transaction): Promise&lt;TransactionSignature&gt; {
  // 1. Verify the transaction signature
  await validateTransactionSignature(transaction);

  // 2. Broadcast the transaction to the network
  const signature = await broadcastTransaction(transaction);

  return signature;
}