import { Address, Transaction } from '../types';
import { AbstractAccount } from './abstract-account';

export class SmartContractAccount implements AbstractAccount {
  address: Address;
  balance: bigint;
  nonce: number;
  validateTransaction: (tx: Transaction) => boolean;

  constructor(address: Address, balance: bigint, nonce: number, validateTransaction: (tx: Transaction) => boolean) {
    this.address = address;
    this.balance = balance;
    this.nonce = nonce;
    this.validateTransaction = validateTransaction;
  }
}