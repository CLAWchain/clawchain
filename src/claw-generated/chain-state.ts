import { Account } from './account';
import { Transaction } from './account';

export class ChainState {
  private accounts: Map<string, Account> = new Map();

  getAccount(address: string): Account {
    if (this.accounts.has(address)) {
      return this.accounts.get(address)!;
    } else {
      const account = new Account();
      this.accounts.set(address, account);
      return account;
    }
  }

  addTransaction(tx: Transaction) {
    const senderAccount = this.getAccount(tx.sender);
    const recipientAccount = this.getAccount(tx.recipient);

    senderAccount.addTransaction(tx, false);
    recipientAccount.addTransaction(tx, false);

    // Update Merkle Patricia Trie
  }

  addPendingTransaction(tx: Transaction) {
    const senderAccount = this.getAccount(tx.sender);
    senderAccount.addTransaction(tx, true);

    // Update Merkle Patricia Trie
  }
}