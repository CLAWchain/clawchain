import { Address, Transaction } from '../types';

export interface AbstractAccount {
  address: Address;
  balance: bigint;
  nonce: number;
  validateTransaction(tx: Transaction): boolean;
}