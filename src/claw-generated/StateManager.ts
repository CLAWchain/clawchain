import { Account, Block, Transaction } from '../types';

export class StateManager {
  private state: Map<string, Account> = new Map();
  private stateRoot: string = '';

  getAccount(address: string): Account {
    return this.state.get(address) || { balance: 0, nonce: 0 };
  }

  updateBalance(address: string, amount: number): void {
    const account = this.getAccount(address);
    account.balance += amount;
    this.state.set(address, account);
    this.updateStateRoot();
  }

  applyTransaction(tx: Transaction): void {
    const senderAccount = this.getAccount(tx.from);
    senderAccount.balance -= tx.value;
    senderAccount.nonce += 1;
    this.state.set(tx.from, senderAccount);

    const receiverAccount = this.getAccount(tx.to);
    receiverAccount.balance += tx.value;
    this.state.set(tx.to, receiverAccount);

    this.updateStateRoot();
  }

  applyBlock(block: Block): void {
    for (const tx of block.transactions) {
      this.applyTransaction(tx);
    }
  }

  getStateRoot(): string {
    return this.stateRoot;
  }

  private updateStateRoot(): void {
    // TODO: Implement state root calculation
    this.stateRoot = 'TODO';
  }
}