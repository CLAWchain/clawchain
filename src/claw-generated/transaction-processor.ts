import { Account } from './account';
import { Transaction } from './transaction';

export class TransactionProcessor {
  private accounts: Map<string, Account> = new Map();

  addAccount(account: Account): void {
    this.accounts.set(account.address, account);
  }

  processTransaction(tx: Transaction): boolean {
    const fromAccount = this.accounts.get(tx.from);
    if (!fromAccount) {
      return false;
    }

    if (!tx.validate(fromAccount)) {
      return false;
    }

    fromAccount.balance -= tx.value;
    fromAccount.nonce++;

    const toAccount = this.accounts.get(tx.to);
    if (toAccount) {
      toAccount.balance += tx.value;
    } else {
      this.accounts.set(tx.to, {
        address: tx.to,
        balance: tx.value,
        nonce: 0,
        validateTransaction: () => true
      });
    }

    return true;
  }
}