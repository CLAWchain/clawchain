import { Account, AccountState } from './account-state';
import { MerklePatriciaTrie } from './merkle-trie';
import { Transaction } from './transaction/transaction';

export class StateManager {
  private accountState: AccountState;
  private stateRoot: Buffer;
  private trie: MerklePatriciaTrie;

  constructor() {
    this.accountState = new AccountState();
    this.trie = new MerklePatriciaTrie();
    this.stateRoot = this.trie.getRootHash();
  }

  getAccountBalance(address: string): number {
    return this.accountState.getBalance(address);
  }

  updateAccountBalance(address: string, amount: number): void {
    this.accountState.updateBalance(address, amount);
    this.updateStateRoot();
  }

  applyTransaction(tx: Transaction): void {
    this.accountState.updateBalance(tx.from, -tx.amount);
    this.accountState.updateBalance(tx.to, tx.amount);
    this.updateStateRoot();
  }

  getStateRoot(): Buffer {
    return this.stateRoot;
  }

  private updateStateRoot(): void {
    this.stateRoot = this.trie.getRootHash();
  }
}