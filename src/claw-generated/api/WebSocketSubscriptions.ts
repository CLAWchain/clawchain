import { EventEmitter } from 'events';
import { Block } from '../Block';
import { Transaction } from '../Transaction';

export class WebSocketSubscriptions extends EventEmitter {
  private blockService: BlockService;
  private transactionService: TransactionService;

  constructor(blockService: BlockService, transactionService: TransactionService) {
    super();
    this.blockService = blockService;
    this.transactionService = transactionService;
  }

  async subscribeToNewHeads(): Promise<void> {
    this.blockService.on('newHead', (head: Block) => {
      this.emit('newHeads', head);
    });
  }

  async subscribeToLogs(address: string): Promise<void> {
    this.transactionService.on('newTransaction', (tx: Transaction) => {
      // Check if the transaction involves the given address
      if (tx.from === address || tx.to === address) {
        this.emit('logs', tx);
      }
    });
  }

  async subscribeToPendingTransactions(): Promise<void> {
    this.transactionService.on('newTransaction', (tx: Transaction) => {
      this.emit('pendingTransactions', tx);
    });
  }
}