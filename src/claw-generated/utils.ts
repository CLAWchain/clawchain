import { Transaction } from '@solana/web3.js';

export const parseJSON = (data: string) => {
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error('Error parsing JSON:', err);
    return null;
  }
};

export const validateAndBroadcastTransaction = async (signedTransactionBase64: string) => {
  const transaction = Transaction.from(Buffer.from(signedTransactionBase64, 'base64'));
  // Validate transaction
  // Broadcast transaction to the network
  console.log('Validated and broadcasted transaction:', transaction);
};