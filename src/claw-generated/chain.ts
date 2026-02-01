import { Block } from '../block';
import { TransactionPool } from '../mempool';
import { StateDB } from '../state';

export class Chain {
  private blocks: Block[] = [];
  private stateDB: StateDB;
  private transactionPool: TransactionPool;

  constructor(stateDB: StateDB, transactionPool: TransactionPool) {
    this.stateDB = stateDB;
    this.transactionPool = transactionPool;
  }

  addBlock(block: Block): void {
    this.blocks.push(block);
    this.stateDB.applyBlockChanges(block);
  }

  getChain(): Block[] {
    return this.blocks;
  }

  reorganizeChain(newChain: Block[]): void {
    // 1. Detect fork point between current chain and new chain
    const forkIndex = this.findForkIndex(newChain);

    // 2. Revert transactions from current chain
    this.revertChain(forkIndex);

    // 3. Replay transactions from new chain
    this.replayChain(newChain, forkIndex);

    // 4. Update chain head
    this.blocks = newChain;
    this.stateDB.updateChainHead(newChain[newChain.length - 1]);
  }

  private findForkIndex(newChain: Block[]): number {
    // Find the index where the new chain diverges from the current chain
    for (let i = 0; i < Math.min(this.blocks.length, newChain.length); i++) {
      if (this.blocks[i].hash !== newChain[i].hash) {
        return i;
      }
    }
    return 0;
  }

  private revertChain(forkIndex: number): void {
    // Revert transactions from current chain starting from the fork index
    for (let i = this.blocks.length - 1; i >= forkIndex; i--) {
      const block = this.blocks[i];
      this.stateDB.revertBlockChanges(block);
      this.transactionPool.addTransactions(block.transactions);
    }
    this.blocks.splice(forkIndex);
  }

  private replayChain(newChain: Block[], forkIndex: number): void {
    // Replay transactions from the new chain, starting from the fork index
    for (let i = forkIndex; i < newChain.length; i++) {
      const block = newChain[i];
      this.stateDB.applyBlockChanges(block);
      this.transactionPool.removeTransactions(block.transactions);
    }
  }
}