import { Transaction } from './Block';
import { StateChannelManager } from './StateChannelManager';

export class TransactionPool {
  private onChainTransactions: Transaction[] = [];
  private stateChannelTransactions: Transaction[] = [];
  private stateChannelManager: StateChannelManager;

  constructor(stateChannelManager: StateChannelManager) {
    this.stateChannelManager = stateChannelManager;
  }

  addTransaction(tx: Transaction): void {
    if (this.isStateChannelTransaction(tx)) {
      this.stateChannelTransactions.push(tx);
    } else {
      this.onChainTransactions.push(tx);
    }
  }

  getOnChainTransactions(): Transaction[] {
    return this.onChainTransactions;
  }

  getStateChannelTransactions(): Transaction[] {
    return this.stateChannelTransactions;
  }

  private isStateChannelTransaction(tx: Transaction): boolean {
    // Check if the transaction is a state channel-related transaction
    // by inspecting the transaction data or other properties
    return this.stateChannelManager.isStateChannelTransaction(tx);
  }
}