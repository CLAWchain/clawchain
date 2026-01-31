import { IncomingMessage, ServerResponse } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import JsonRpcServer from './JsonRpcServer';
import { Transaction } from './transaction';
import { BlockExplorer } from './BlockExplorer';

class WebSocketServer extends JsonRpcServer {
  private wss: WebSocketServer;
  private transactionQueue: Transaction[] = [];
  private blockExplorer: BlockExplorer;

  constructor() {
    super();
    this.wss = new WebSocketServer({ port: 8080 });
    this.blockExplorer = new BlockExplorer();

    this.wss.on('connection', (ws, req) => {
      console.log('WebSocket connection established');
      ws.on('message', (data) => {
        this.handleWebSocketMessage(ws, data.toString());
      });
    });

    // Start the transaction feed broadcast loop
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

  registerSubscription(name: string, handler: (params: any, ws: WebSocket) => void) {
    this.methodHandlers[name] = (params) => {
      this.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          handler(params, client);
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
      this.broadcastTransactions(newTransactions);
    }, 1000);
  }

  private async getNewTransactions(): Promise<Transaction[]> {
    // TODO: Implement logic to fetch new transactions from the mempool
    return [];
  }

  private broadcastTransactions(transactions: Transaction[]) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'transactions', data: transactions }));
      }
    });
  }

  registerTransactionFeedSubscription() {
    this.registerSubscription('subscribeToTransactionFeed', (params, ws) => {
      // TODO: Implement logic to handle transaction feed subscriptions
    });
  }
}

export default WebSocketServer;