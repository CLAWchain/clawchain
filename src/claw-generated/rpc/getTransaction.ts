import { Provider } from '@ethersproject/providers';
import { Transaction } from '../transaction/transaction';

export async function handleGetTransaction(
  transactionSignature: string,
  provider: Provider
): Promise<Transaction | null> {
  // Set the provider for the Transaction class
  Transaction.setProvider(provider);

  // Query the chain for the transaction
  const transaction = await Transaction.getBySignature(transactionSignature);

  // Return the transaction if found, or null if not found
  return transaction || null;
}