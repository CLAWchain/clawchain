import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { Block } from './Block';
import { Transaction } from './Transaction';
import { TransactionService } from './TransactionService';

interface WebSocketSubscription {
  topic: string;
  callback: (data: any) => void;
}

class WebSocketServer extends EventEmitter {
  private wss: WebSocket.Server;
  private subscriptions: WebSocketSubscription[] = [];
  private transactionService: TransactionService;

  constructor(port: number, transactionService: TransactionService) {
    super();
    this.transactionService = transactionService;
    this.wss = new WebSocket.Server({ port });
    this.wss.on('connection', this.handleConnection.bind(this));

    this.transactionService.on('newTransaction', this.publishTransaction.bind(this));
    this.transactionService.on('transactionConfirmed', this.publishTransactionConfirmation.bind(this));
    this.transactionService.on('newBlock', this.publishNewBlock.bind(this));
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
    this.subscriptions.push({
      topic,
      callback: (data) => {
        ws.send(JSON.stringify({ topic, data }));
      },
    });
  }

  handleUnsubscription(ws: WebSocket, topic: string) {
    console.log('Unsubscription:', topic);
    this.subscriptions = this.subscriptions.filter((sub) => sub.topic !== topic || sub.callback.toString() !== ws.toString());
  }

  unsubscribeClient(ws: WebSocket) {
    this.subscriptions = this.subscriptions.filter((sub) => sub.callback.toString() !== ws.toString());
  }

  publishTransaction(tx: Transaction) {
    this.subscriptions
      .filter((sub) => sub.topic === 'newTransactions')
      .forEach((sub) => sub.callback(tx));
  }

  publishTransactionConfirmation(receipt: TransactionReceipt) {
    this.subscriptions
      .filter((sub) => sub.topic === 'transactionConfirmations')
      .forEach((sub) => sub.callback(receipt));
  }

  publishNewBlock(block: Block) {
    this.subscriptions
      .filter((sub) => sub.topic === 'newBlocks')
      .forEach((sub) => sub.callback(block));
  }
}

export { WebSocketServer };