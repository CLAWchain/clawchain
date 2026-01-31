import { Account } from './account';
import { Trie } from './trie';

export class State {
  private accountTrie: Trie;
  private accounts: Map<string, Account>;

  constructor() {
    this.accountTrie = new Trie();
    this.accounts = new Map();
  }

  getAccount(address: Buffer): Account {
    const addressHex = address.toString('hex');
    if (this.accounts.has(addressHex)) {
      return this.accounts.get(addressHex)!;
    }

    const account = new Account();
    this.accounts.set(addressHex, account);
    this.accountTrie.set(address, account.rlp());
    return account;
  }

  commitState(): void {
    this.accountTrie.commit();
  }

  getStateRoot(): Buffer {
    return this.accountTrie.root;
  }
}