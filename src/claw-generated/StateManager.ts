import { Account } from '../models/Account';
import { TransactionReceipt } from '../models/TransactionReceipt';
import { MerklePatriciaTrie } from '../trie/MerklePatriciaTrie';

export class StateManager {
  private accountTrie: MerklePatriciaTrie<Account>;
  private stateRoot: Buffer;

  constructor() {
    this.accountTrie = new MerklePatriciaTrie<Account>();
    this.stateRoot = this.accountTrie.root;
  }

  getAccount(address: Buffer): Account {
    return this.accountTrie.get(address);
  }

  updateBalance(address: Buffer, amount: bigint): void {
    const account = this.getAccount(address);
    account.balance += amount;
    this.accountTrie.set(address, account);
    this.stateRoot = this.accountTrie.root;
  }

  applyTransaction(tx: TransactionReceipt): void {
    this.updateBalance(tx.from, -tx.value);
    this.updateBalance(tx.to, tx.value);
  }

  getStateRoot(): Buffer {
    return this.stateRoot;
  }
}