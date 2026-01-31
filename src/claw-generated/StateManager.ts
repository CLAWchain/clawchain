import { Account, Transaction } from '../types';
import { MerklePatriciaTrie } from './MerklePatriciaTrie';

export class StateManager {
  private trie: MerklePatriciaTrie;

  constructor() {
    this.trie = new MerklePatriciaTrie();
  }

  getAccountBalance(address: string): number {
    const account = this.trie.get<Account>(address);
    return account?.balance || 0;
  }

  updateAccountBalance(address: string, balance: number): void {
    const account = this.trie.get<Account>(address) || { address, balance: 0 };
    account.balance = balance;
    this.trie.set(address, account);
  }

  applyTransaction(tx: Transaction): void {
    const senderAccount = this.trie.get<Account>(tx.from);
    if (senderAccount && senderAccount.balance >= tx.value) {
      senderAccount.balance -= tx.value;
      this.trie.set(tx.from, senderAccount);

      const receiverAccount = this.trie.get<Account>(tx.to) || { address: tx.to, balance: 0 };
      receiverAccount.balance += tx.value;
      this.trie.set(tx.to, receiverAccount);
    }
  }

  getStateRoot(): string {
    return this.trie.getRoot();
  }
}