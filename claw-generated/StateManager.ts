import { Account, Transaction, TransactionReceipt } from '../types';

export class StateManager {
  private state: { [address: string]: Account } = {};
  private stateRoot: string = '';

  getAccount(address: string): Account {
    return this.state[address] || { balance: 0, nonce: 0 };
  }

  updateBalance(address: string, amount: number): void {
    const account = this.getAccount(address);
    account.balance += amount;
    this.state[address] = account;
  }

  updateNonce(address: string, newNonce: number): void {
    const account = this.getAccount(address);
    account.nonce = newNonce;
    this.state[address] = account;
  }

  calculateStateRoot(): string {
    // TODO: Implement Merkle Patricia Trie logic to calculate state root
    return this.stateRoot;
  }

  applyTransaction(tx: Transaction): TransactionReceipt {
    const { from, to, value, nonce } = tx;
    const fromAccount = this.getAccount(from);
    const toAccount = this.getAccount(to);

    // Verify nonce
    if (fromAccount.nonce !== nonce) {
      throw new Error('Invalid transaction nonce');
    }

    // Update balances
    this.updateBalance(from, -value);
    this.updateBalance(to, value);
    this.updateNonce(from, nonce + 1);

    // Update state root
    this.stateRoot = this.calculateStateRoot();

    return {
      status: 'success',
      gasUsed: 21000, // Placeholder value
      events: [],
    };
  }
}