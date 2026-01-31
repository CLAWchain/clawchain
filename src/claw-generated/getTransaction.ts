import { Transaction } from '../chain/transaction';

export async function getTransaction(signature: string): Promise&lt;Transaction | null&gt; {
  // Fetch the transaction from the chain by signature
  const transaction = await Transaction.getBySignature(signature);

  // Return the full transaction data or null if not found
  return transaction || null;
}