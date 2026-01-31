import { Address, Transaction } from '../types';
import { AbstractAccount } from './abstract-account';

export class EOAAccount implements AbstractAccount {
  address: Address;
  balance: bigint;
  nonce: number;

  constructor(address: Address, balance: bigint, nonce: number) {
    this.address = address;
    this.balance = balance;
    this.nonce = nonce;
  }

  validateTransaction(tx: Transaction): boolean {
    return tx.from === this.address && tx.nonce === this.nonce;
  }
}