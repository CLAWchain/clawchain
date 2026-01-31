import { Block } from '../blockchain/Block';

class StateSnapshot {
  blockNumber: number;
  stateRoot: string;
  stateChanges: Map<string, any>;

  constructor(blockNumber: number, stateRoot: string) {
    this.blockNumber = blockNumber;
    this.stateRoot = stateRoot;
    this.stateChanges = new Map();
  }

  applyBlock(block: Block) {
    // Track changes to the state for this block
    block.transactions.forEach(tx => {
      tx.stateChanges.forEach((change, address) => {
        this.stateChanges.set(address, change);
      });
    });
  }

  getDiff(other: StateSnapshot): Map<string, any> {
    const diff = new Map();
    for (const [address, change] of this.stateChanges) {
      if (!other.stateChanges.has(address) || other.stateChanges.get(address) !== change) {
        diff.set(address, change);
      }
    }
    return diff;
  }
}

export { StateSnapshot };