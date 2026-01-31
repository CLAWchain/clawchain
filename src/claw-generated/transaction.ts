import { Account } from './account';

export class Transaction {
  from: Address;
  to: Address;
  value: bigint;
  nonce: number;
  // other tx fields

  constructor(from: Address, to: Address, value: bigint, nonce: number) {
    this.from = from;
    this.to = to;
    this.value = value;
    this.nonce = nonce;
  }

  validate(account: Account): boolean {
    return account.validationLogic(this);
  }

  execute(account: Account): void {
    if (!this.validate(account)) {
      throw new Error('Invalid transaction');
    }

    account.balance -= this.value;
    account.nonce++;
  }
}