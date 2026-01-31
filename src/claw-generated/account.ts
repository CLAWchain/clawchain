import { ByteArray, Address } from '../types';

export interface Account {
  address: Address;
  balance: bigint;
  nonce: number;
  validationLogic: (tx: Transaction) => boolean;
}

export class EOAAccount implements Account {
  address: Address;
  balance: bigint;
  nonce: number;
  validationLogic: (tx: Transaction) => boolean;

  constructor(address: Address, balance: bigint, nonce: number) {
    this.address = address;
    this.balance = balance;
    this.nonce = nonce;
    this.validationLogic = (tx: Transaction) => {
      return tx.from === this.address && tx.nonce === this.nonce;
    };
  }
}

export class SmartContractAccount implements Account {
  address: Address;
  balance: bigint;
  nonce: number;
  validationLogic: (tx: Transaction) => boolean;

  constructor(address: Address, balance: bigint, nonce: number, validationLogic: (tx: Transaction) => boolean) {
    this.address = address;
    this.balance = balance;
    this.nonce = nonce;
    this.validationLogic = validationLogic;
  }
}