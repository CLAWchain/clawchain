import { StateManager, StateChannelManager } from './StateManager';
import { Transaction, Block } from './Block';
import { TransactionReceipt } from './TransactionReceipt';
import { TransactionPool } from './TransactionPool';

export class Chain {
  private stateManager: StateManager;
  private stateChannelManager: StateChannelManager;
  private transactionPool: TransactionPool;

  constructor() {
    this.stateManager = new StateManager();
    this.stateChannelManager = new StateChannelManager();
    this.transactionPool = new TransactionPool();
  }

  async initialize(): Promise<void> {
    await this.stateManager.initialize();
    await this.stateChannelManager.initialize();
    // Initialize other components...
  }

  async processBlock(block: Block): Promise<TransactionReceipt[]> {
    const receipts: TransactionReceipt[] = [];

    // Process on-chain transactions
    for (const tx of block.transactions) {
      const receipt = await this.processTransaction(tx, block.height);
      receipts.push(receipt);
    }

    // Process state channel-related transactions
    for (const tx of block.stateChannelTransactions) {
      const receipt = await this.processStateChannelTransaction(tx, block.height);
      receipts.push(receipt);
    }

    // Apply block reward
    await this.stateManager.applyBlockReward(block.producer, block.height);

    // Update state root
    this.stateManager.stateRoot = this.stateManager.calculateStateRoot();
    this.stateChannelManager.stateRoot = this.stateChannelManager.calculateStateRoot();

    return receipts;
  }

  private async processTransaction(tx: Transaction, blockHeight: number): Promise<TransactionReceipt> {
    const success = await this.stateManager.applyTransaction(tx, blockHeight);
    return new TransactionReceipt(tx, success);
  }

  private async processStateChannelTransaction(tx: Transaction, blockHeight: number): Promise<TransactionReceipt> {
    const success = await this.stateChannelManager.applyStateChannelTransaction(tx, blockHeight);
    return new TransactionReceipt(tx, success);
  }
}