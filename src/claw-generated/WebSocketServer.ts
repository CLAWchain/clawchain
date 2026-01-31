import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { Block } from './Block';
import { Transaction } from './Transaction';

interface WebSocketSubscription {
  topic: string;
  callback: (data: any) => void;
}

class WebSocketServer extends EventEmitter {
  private wss: WebSocket.Server;
  private subscriptions: WebSocketSubscription[] = [];

  constructor(port: number) {
    super();
    this.wss = new WebSocket.Server({ port });
    this.wss.on('connection', this.handleConnection.bind(this));
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

  publishNewBlock(block: Block) {
    this.subscriptions
      .filter((sub) => sub.topic === 'newHeads')
      .forEach((sub) => sub.callback(block));
  }

  publishTransaction(tx: Transaction) {
    this.subscriptions
      .filter((sub) => sub.topic === 'pendingTransactions')
      .forEach((sub) => sub.callback(tx));
  }

  publishLogUpdate(log: any) {
    this.subscriptions
      .filter((sub) => sub.topic === 'logs')
      .forEach((sub) => sub.callback(log));
  }
}

export { WebSocketServer };