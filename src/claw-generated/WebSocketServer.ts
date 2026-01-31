import { IncomingMessage, ServerResponse } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import JsonRpcServer from './JsonRpcServer';
import { Transaction } from './transaction';
import { BlockExplorer } from './BlockExplorer';
import WebSocketSubscriptions from './WebSocketSubscriptions';

class WebSocketServer extends JsonRpcServer {
  private wss: WebSocketServer;
  private transactionQueue: Transaction[] = [];
  private blockExplorer: BlockExplorer;
  private subscriptions: WebSocketSubscriptions;

  constructor() {
    super();
    this.wss = new WebSocketServer({ port: 8080 });
    this.blockExplorer = new BlockExplorer();
    this.subscriptions = new WebSocketSubscriptions();

    this.wss.on('connection', (ws, req) => {
      console.log('WebSocket connection established');
      ws.on('message', (data) => {
        this.handleWebSocketMessage(ws, data.toString());
      });
    });

    this.registerSubscriptionHandlers();
    this.startTransactionFeed();
  }

  handleWebSocketMessage(ws: WebSocket, message: string) {
    try {
      const jsonRpcRequest = JSON.parse(message);
      const jsonRpcResponse = this.handleJsonRpcRequest(jsonRpcRequest);
      ws.send(JSON.stringify(jsonRpcResponse));
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
      ws.send(JSON.stringify({ error: 'Invalid JSON-RPC request' }));
    }
  }

  registerSubscriptionHandlers() {
    this.registerSubscription('subscribe', (params, ws) => {
      this.subscriptions.subscribe(ws, params.topic);
      return { result: 'Subscribed' };
    });

    this.registerSubscription('unsubscribe', (params, ws) => {
      this.subscriptions.unsubscribe(ws, params.topic);
      return { result: 'Unsubscribed' };
    });

    this.registerSubscription('newHeads', (params, ws) => {
      // TODO: Implement newHeads subscription
      return null;
    });

    this.registerSubscription('logs', (params, ws) => {
      // TODO: Implement logs subscription
      return null;
    });

    this.registerSubscription('pendingTransactions', (params, ws) => {
      // TODO: Implement pendingTransactions subscription
      return null;
    });
  }

  registerSubscription(name: string, handler: (params: any, ws: WebSocket) => any) {
    this.methodHandlers[name] = (params) => {
      this.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          const result = handler(params, client);
          if (result !== null) {
            client.send(JSON.stringify(result));
          }
        }
      });
      return null;
    };
  }

  private startTransactionFeed() {
    setInterval(async () => {
      // Check for new transactions in the mempool
      const newTransactions = await this.getNewTransactions();
      this.transactionQueue = this.transactionQueue.concat(newTransactions);

      // Broadcast new transactions to all connected clients
      this.subscriptions.broadcastPendingTransactions(newTransactions);
    }, 1000);
  }

  private async getNewTransactions(): Promise<Transaction[]> {
    // TODO: Implement logic to fetch new transactions from the mempool
    return [];
  }
}

export default WebSocketServer;