import { TransactionReceipt, TransactionRequest } from '@ethersproject/providers';
import { hexlify, toUtf8Bytes } from '@ethersproject/bytes';
import { keccak256 } from '@ethersproject/keccak256';
import { parseTransaction } from '@ethersproject/transactions';
import { Transaction } from '../core/transaction';
import { Provider } from '@ethersproject/providers';

export async function handleSendTransaction(rawTransaction: string, provider: Provider): Promise<TransactionReceipt> {
  // Set the provider for the Transaction class
  Transaction.setProvider(provider);

  // 1. Decode the base64-encoded transaction
  const decodedTx = parseTransaction(hexlify(toUtf8Bytes(rawTransaction)));

  // 2. Validate the transaction
  await Transaction.validate(decodedTx);

  // 3. Broadcast the transaction to the network
  const txHash = await Transaction.broadcast(decodedTx);

  // 4. Wait for the transaction to be mined and return the receipt
  const txReceipt = await provider.getTransactionReceipt(txHash);
  return txReceipt;
}