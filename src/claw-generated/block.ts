import { StateManager } from './state_manager';
import { Transaction } from './transaction';

class Block {
  private stateManager: StateManager;
  private transactions: Transaction[];
  private previousHash: string;
  private hash: string;

  constructor(
    stateManager: StateManager,
    transactions: Transaction[],
    previousHash: string
  ) {
    this.stateManager = stateManager;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  validateBlock(): boolean {
    // Validate the block by:
    // 1. Verifying the transactions
    // 2. Updating the state with the transactions
    // 3. Verifying the state root hash

    let currentState = this.stateManager.getStateRoot();

    for (const tx of this.transactions) {
      if (!tx.verify()) {
        return false;
      }

      tx.apply(this.stateManager);
      currentState = this.stateManager.getStateRoot();
    }

    return currentState === this.hash;
  }

  private calculateHash(): string {
    // Calculate the block hash based on the state root, previous hash, and transactions
    // (implementation omitted for brevity)
  }
}

export { Block };