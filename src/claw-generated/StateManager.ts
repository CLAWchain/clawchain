import { Block } from '../blockchain/Block';
import { Transaction } from '../transactions/Transaction';
import { Mutex } from 'async-mutex';

class StateManager {
  private state: Map<string, any>;
  private mutex: Mutex;

  constructor() {
    this.state = new Map();
    this.mutex = new Mutex();
  }

  async applyBlock(block: Block): Promise<void> {
    await this.mutex.acquire();
    try {
      block.transactions.forEach(tx => this.applyTransaction(tx));
    } finally {
      this.mutex.release();
    }
  }

  async applyTransaction(tx: Transaction): Promise<void> {
    await this.mutex.acquire();
    try {
      // Apply the transaction to the state using atomic operations
      this.state.set(tx.from, (this.state.get(tx.from) || 0) - tx.amount);
      this.state.set(tx.to, (this.state.get(tx.to) || 0) + tx.amount);
    } finally {
      this.mutex.release();
    }
  }

  getState(): Map<string, any> {
    return this.state;
  }
}

export { StateManager };