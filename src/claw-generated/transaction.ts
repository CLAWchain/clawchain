import { Ed25519Signature } from 'crypto';
import { Account } from './account';

export interface Transaction {
  id: string;
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  signature: Ed25519Signature;
  nonce: number;
}

export interface TransactionInput {
  prevTxId: string;
  outputIndex: number;
  unlockingScript: string;
}

export interface TransactionOutput {
  value: number;
  lockingScript: string;
}

export function validateTransaction(tx: Transaction, accounts: Account[]): boolean {
  // Validate nonce
  const senderAccount = accounts.find(a => a.address === tx.inputs[0].address);
  if (!senderAccount || tx.nonce <= senderAccount.nonce) {
    return false;
  }

  // TODO: Implement signature verification and other validation rules
  return true;
}