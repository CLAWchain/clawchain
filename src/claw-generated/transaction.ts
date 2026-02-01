import { PublicKey } from './wallet';

export interface Transaction {
  from: PublicKey;
  to: PublicKey;
  amount: number;
  nonce: number;
  signature: string;
}

export interface TransactionNonces {
  [key: string]: number;
}

let transactionNonces: TransactionNonces = {};

export function createTransaction(from: PublicKey, to: PublicKey, amount: number, nonce: number): Transaction {
  const fromString = from.toString();
  if (!transactionNonces[fromString] || nonce > transactionNonces[fromString]) {
    transactionNonces[fromString] = nonce;
    return {
      from,
      to,
      amount,
      nonce,
      signature: ''
    };
  } else {
    throw new Error(`Nonce ${nonce} is less than or equal to the last used nonce ${transactionNonces[fromString]} for account ${fromString}`);
  }
}

export function getTransactionNonce(publicKey: PublicKey): number {
  const publicKeyString = publicKey.toString();
  return transactionNonces[publicKeyString] || 0;
}