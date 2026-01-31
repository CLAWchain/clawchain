import { Account } from '../account/Account';

class StateSnapshot {
  public blockNumber: number;
  private accounts: Map<string, Account> = new Map();

  constructor(blockNumber?: number) {
    this.blockNumber = blockNumber || 0;
  }

  applyBlock(block: any) {
    // Apply the transactions in the block to the state
    block.transactions.forEach(tx => this.applyTransaction(tx));
    this.blockNumber = block.number;
  }

  applyTransaction(tx: any) {
    // Apply the transaction to the state
    const senderAccount = this.getAccount(tx.from);
    const receiverAccount = this.getAccount(tx.to);
    senderAccount.balance -= tx.value;
    receiverAccount.balance += tx.value;
  }

  getAccount(address: string): Account {
    if (!this.accounts.has(address)) {
      this.accounts.set(address, new Account(address));
    }
    return this.accounts.get(address)!;
  }

  serialize(): string {
    // Serialize the state snapshot to a string
    return JSON.stringify({
      blockNumber: this.blockNumber,
      accounts: Array.from(this.accounts.values()).map(account => account.serialize())
    });
  }

  static deserialize(snapshotData: string): StateSnapshot {
    // Deserialize a state snapshot from a string
    const { blockNumber, accounts } = JSON.parse(snapshotData);
    const snapshot = new StateSnapshot(blockNumber);
    accounts.forEach(accountData => {
      const account = Account.deserialize(accountData);
      snapshot.accounts.set(account.address, account);
    });
    return snapshot;
  }
}

export { StateSnapshot };