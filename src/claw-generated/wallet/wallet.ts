import { Transaction } from '../transaction/transaction';
import { Account } from '../account/account';
import { crypto } from '../utils/crypto';

export class Wallet {
  private accounts: Account[];

  constructor() {
    this.accounts = [];
  }

  addAccount(account: Account) {
    this.accounts.push(account);
  }

  sendTransaction(transaction: Transaction) {
    // TODO: Implement transaction signing and sending
  }

  signTransaction(transaction: Transaction, account: Account): Transaction {
    const signature = crypto.sign(transaction.serialize(), account.privateKey);
    return transaction.withSignature(signature);
  }
}