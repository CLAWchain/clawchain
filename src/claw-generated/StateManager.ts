import { MerklePatriciaTrie } from '../trie/MerklePatriciaTrie';
import { Account } from './Account';

export class StateManager {
  private trie: MerklePatriciaTrie;

  constructor() {
    this.trie = new MerklePatriciaTrie();
  }

  getAccount(address: string): Account {
    const accountData = this.trie.get(address);
    return accountData ? new Account(accountData) : new Account();
  }

  updateAccount(address: string, account: Account): void {
    this.trie.set(address, account.serialize());
  }

  getStateRoot(): string {
    return this.trie.getRoot();
  }
}