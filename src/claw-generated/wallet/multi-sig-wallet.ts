import { Wallet } from './wallet';
import { Transaction } from '../transaction/transaction';
import { Account } from '../account/account';

export class MultiSigWallet extends Wallet {
  private requiredSignatures: number;
  private owners: Account[];

  constructor(requiredSignatures: number, owners: Account[]) {
    super();
    this.requiredSignatures = requiredSignatures;
    this.owners = owners;
  }

  addOwner(account: Account) {
    this.owners.push(account);
  }

  sendTransaction(transaction: Transaction): boolean {
    // TODO: Implement multi-signature transaction signing and verification
    return false;
  }
}