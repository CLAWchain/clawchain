import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { Block } from './Block';
import { Transaction, TransactionReceipt } from './Transaction';
import { TransactionService } from './TransactionService';
import { WebSocketSubscriptions } from './WebSocketSubscriptions';

class WebSocketServer extends EventEmitter {
  private wss: WebSocket.Server;
  private subscriptions: WebSocketSubscriptions;

  constructor(port: number, transactionService: TransactionService) {
    super();
    this.subscriptions = new WebSocketSubscriptions(this);
    this.wss = new WebSocket.Server({ port });
    this.wss.on('connection', this.handleConnection.bind(this));

    transactionService.on('newTransaction', this.publishTransaction.bind(this));
    transactionService.on('transactionConfirmed', this.publishTransactionConfirmation.bind(this));
    transactionService.on('newBlock', this.publishNewBlock.bind(this));
  }

  handleConnection(ws: WebSocket) {
    console.log('New WebSocket connection');

    ws.on('message', (data) => {
      this.handleMessage(ws, data);
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      this.unsubscribeClient(ws);
    });
  }

  handleMessage(ws: WebSocket, data: string) {
    try {
      const message = JSON.parse(data);
      if (message.type === 'subscribe') {
        this.handleSubscription(ws, message.topic);
      } else if (message.type === 'unsubscribe') {
        this.handleUnsubscription(ws, message.topic);
      } else {
        console.error('Unknown WebSocket message type:', message.type);
      }
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  }

  handleSubscription(ws: WebSocket, topic: string) {
    console.log('New subscription:', topic);
    switch (topic) {
      case 'newHeads':
        this.subscriptions.subscribeNewHeads();
        break;
      case 'logs':
        this.subscriptions.subscribeLogs('');
        break;
      case 'pendingTransactions':
        this.subscriptions.subscribePendingTransactions();
        break;
      default:
        console.error('Unknown subscription topic:', topic);
    }
  }

  handleUnsubscription(ws: WebSocket, topic: string) {
    // TODO: Implement unsubscription logic
  }

  unsubscribeClient(ws: WebSocket) {
    // TODO: Implement client unsubscription
  }

  publishTransaction(tx: Transaction) {
    this.subscriptions.emit('pendingTransaction', tx);
  }

  publishTransactionConfirmation(receipt: TransactionReceipt) {
    this.subscriptions.emit('transactionConfirmed', receipt);
  }

  publishNewBlock(block: Block) {
    this.subscriptions.emit('newBlock', block);
  }

  publishLogUpdate(log: any) {
    this.subscriptions.emit('log', log);
  }
}

export { WebSocketServer };