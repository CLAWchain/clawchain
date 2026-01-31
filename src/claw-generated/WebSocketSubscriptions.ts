import { Block } from './Block';
import { Transaction, TransactionReceipt } from './Transaction';
import { WebSocketServer } from './WebSocketServer';
import { EventEmitter } from 'events';

class WebSocketSubscriptions extends EventEmitter {
  private wss: WebSocketServer;

  constructor(wss: WebSocketServer) {
    super();
    this.wss = wss;
  }

  async subscribeNewHeads() {
    this.wss.on('newBlock', (block: Block) => {
      this.emit('newHead', block);
      this.wss.publishNewBlock(block);
    });
  }

  async subscribePendingTransactions() {
    this.wss.on('newTransaction', (tx: Transaction) => {
      this.emit('pendingTransaction', tx);
      this.wss.publishTransaction(tx);
    });
  }

  async subscribeLogs(address: string) {
    this.wss.on('newLog', (log: any) => {
      this.emit('log', log);
      this.wss.publishLogUpdate(log);
    });
  }
}

export { WebSocketSubscriptions };