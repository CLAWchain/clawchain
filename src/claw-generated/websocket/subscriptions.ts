import WebSocketServer from './server';
import { BlockHeader, Log, Transaction } from '../types';

class WebSocketSubscriptions {
  private server: WebSocketServer;

  constructor(server: WebSocketServer) {
    this.server = server;
  }

  async onNewHeads(header: BlockHeader) {
    this.server.publish('newHeads', header);
  }

  async onLogs(logs: Log[]) {
    this.server.publish('logs', logs);
  }

  async onPendingTransactions(txs: Transaction[]) {
    this.server.publish('pendingTransactions', txs);
  }
}

export default WebSocketSubscriptions;