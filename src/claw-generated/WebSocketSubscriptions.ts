import { Block } from './Block';
import { Transaction } from './Transaction';
import { WebSocketServer } from './WebSocketServer';

class WebSocketSubscriptions {
  private wss: WebSocketServer;

  constructor(wss: WebSocketServer) {
    this.wss = wss;
  }

  async subscribeNewHeads() {
    this.wss.on('newBlock', (block: Block) => {
      this.wss.publishNewBlock(block);
    });
  }

  async subscribePendingTransactions() {
    this.wss.on('newTransaction', (tx: Transaction) => {
      this.wss.publishTransaction(tx);
    });
  }

  async subscribeLogs(address: string) {
    // Subscribe to logs for the given address
    this.wss.on('newLog', (log: any) => {
      this.wss.publishLogUpdate(log);
    });
  }
}

export { WebSocketSubscriptions };