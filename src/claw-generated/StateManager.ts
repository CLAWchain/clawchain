import { Account } from './account';
import { Trie } from './trie';
import { Transaction } from './transaction';

export class StateManager {
  private accountTrie: Trie;
  private accounts: Map<string, Account>;
  private transactions: Map<string, Transaction>;

  constructor() {
    this.accountTrie = new Trie();
    this.accounts = new Map();
    this.transactions = new Map();
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

  async getTransaction(signature: string): Promise<Transaction | null> {
    if (this.transactions.has(signature)) {
      return this.transactions.get(signature)!;
    }
    return null;
  }

  commitState(): void {
    this.accountTrie.commit();
  }

  getStateRoot(): Buffer {
    return this.accountTrie.root;
  }
}