import { State } from './state';
import { Transaction } from './transaction';
import { Block } from './block';

export class Blockchain {
  private state: State;
  private pendingTransactions: Transaction[];
  private blocks: Block[];

  constructor() {
    this.state = new State();
    this.pendingTransactions = [];
    this.blocks = [];
  }

  addTransaction(tx: Transaction): void {
    this.pendingTransactions.push(tx);
  }

  mineBlock(): Block {
    const block = new Block(this.pendingTransactions, this.state.getStateRoot());
    this.state.commitState();
    this.blocks.push(block);
    this.pendingTransactions = [];
    return block;
  }

  getLatestBlock(): Block {
    return this.blocks[this.blocks.length - 1];
  }
}