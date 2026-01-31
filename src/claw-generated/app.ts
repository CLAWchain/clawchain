import WebSocketServer from './websocket/server';
import WebSocketSubscriptions from './websocket/subscriptions';
import { BlockProcessor, TransactionPool } from './core';

class ClawChainApp {
  private webSocketServer: WebSocketServer;
  private webSocketSubscriptions: WebSocketSubscriptions;
  private blockProcessor: BlockProcessor;
  private transactionPool: TransactionPool;

  constructor() {
    this.webSocketServer = new WebSocketServer(8080);
    this.webSocketSubscriptions = new WebSocketSubscriptions(this.webSocketServer);

    this.blockProcessor = new BlockProcessor();
    this.blockProcessor.on('newHead', this.webSocketSubscriptions.onNewHeads.bind(this.webSocketSubscriptions));

    this.transactionPool = new TransactionPool();
    this.transactionPool.on('newPendingTransactions', this.webSocketSubscriptions.onPendingTransactions.bind(this.webSocketSubscriptions));
    // TODO: Implement onLogs subscription
  }

  start() {
    console.log('ClawChain app started');
  }
}

export default ClawChainApp;