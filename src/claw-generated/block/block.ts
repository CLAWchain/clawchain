import { BlockFinality } from './block-finality';
import { Transaction } from '../transaction/transaction';
import { CheckpointManager } from '../checkpoint_manager';

class Block {
  hash: string;
  height: number;
  parentHash: string;
  timestamp: number;
  transactions: Transaction[];
  finality: BlockFinality;
  checkpointManager: CheckpointManager;

  constructor(
    hash: string,
    height: number, 
    parentHash: string,
    timestamp: number,
    transactions: Transaction[],
    confirmationsRequired: number = 6
  ) {
    this.hash = hash;
    this.height = height;
    this.parentHash = parentHash;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.finality = new BlockFinality(confirmationsRequired);
    this.checkpointManager = new CheckpointManager();
  }

  addTransaction(tx: Transaction): void {
    this.transactions.push(tx);
  }

  addToFinality(): void {
    this.finality.addBlock(this);
    this.checkpointManager.generateCheckpoint(this);
  }

  addPendingBlock(): void {
    this.finality.addPendingBlock(this);
  }

  isFinal(): boolean {
    return this.finality.isBlockFinalized(this);
  }

  getFinalizationStatus(): 'finalized' | 'pending' {
    return this.finality.getFinalizationStatus(this);
  }
}

export { Block };