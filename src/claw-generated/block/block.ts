import { BlockFinality } from './block-finality';
import { Transaction } from '../transaction/transaction';

class Block {
  hash: string;
  parentHash: string;
  timestamp: number;
  transactions: Transaction[];
  finality: BlockFinality;

  constructor(
    hash: string,
    parentHash: string,
    timestamp: number,
    transactions: Transaction[],
    confirmationsRequired: number = 6
  ) {
    this.hash = hash;
    this.parentHash = parentHash;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.finality = new BlockFinality(confirmationsRequired);
  }

  addTransaction(tx: Transaction): void {
    this.transactions.push(tx);
  }

  addToFinality(): void {
    this.finality.addBlock(this);
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