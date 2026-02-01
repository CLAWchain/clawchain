import { BlockHeader } from '../chain/BlockHeader';
import { Account } from './Account';

export class StateManager {
  private state: { [key: string]: Account } = {};
  private previousState: { [key: string]: Account } = {};
  private stateDiffs: { [blockHash: string]: { [address: string]: Account } } = {};

  applyBlockChanges(blockHeader: BlockHeader) {
    // Store the current state as the previous state
    this.previousState = { ...this.state };

    // Apply the changes from the new block
    blockHeader.transactions.forEach(tx => {
      const senderAccount = this.getAccount(tx.from);
      senderAccount.balance -= tx.amount;
      this.updateAccount(tx.from, senderAccount);

      const receiverAccount = this.getAccount(tx.to);
      receiverAccount.balance += tx.amount;
      this.updateAccount(tx.to, receiverAccount);
    });

    // Generate the state diff
    this.stateDiffs[blockHeader.hash] = this.getDiff(this.previousState, this.state);
  }

  getAccount(address: string): Account {
    return this.state[address] || new Account();
  }

  updateAccount(address: string, account: Account) {
    this.state[address] = account;
  }

  private getDiff(
    previousState: { [key: string]: Account },
    newState: { [key: string]: Account }
  ): { [address: string]: Account } {
    const diff: { [address: string]: Account } = {};

    for (const address in newState) {
      if (
        !previousState[address] ||
        !previousState[address].equals(newState[address])
      ) {
        diff[address] = newState[address];
      }
    }

    return diff;
  }
}