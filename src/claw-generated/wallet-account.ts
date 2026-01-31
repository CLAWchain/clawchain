import { Account } from './account';
import { Transaction } from '../transactions/transaction';
import { ContractState } from '../contracts/contract-state';

export class WalletAccount implements Account {
  address: string;
  balance: BigInt;
  nonce: number;
  contractState: ContractState;

  constructor(address: string, balance: BigInt, nonce: number, contractState: ContractState) {
    this.address = address;
    this.balance = balance;
    this.nonce = nonce;
    this.contractState = contractState;
  }

  validateTransaction(tx: Transaction): boolean {
    // Validate the transaction against the custom contract logic
    return this.contractState.validateTransaction(tx);
  }
}