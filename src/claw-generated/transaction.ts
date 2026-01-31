import { Ed25519Signature } from 'crypto';

export interface Transaction {
  id: string;
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  signature: Ed25519Signature;
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

export function validateTransaction(tx: Transaction): boolean {
  // TODO: Implement signature verification and other validation rules
  return true;
}