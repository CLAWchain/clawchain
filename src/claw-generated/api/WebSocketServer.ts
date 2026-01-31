import WebSocket, { WebSocketServer } from 'ws';
import { TransactionService } from '../TransactionService';
import { BlockService } from '../BlockService';

export class ClawWebSocketServer {
  private wss: WebSocketServer;
  private transactionService: TransactionService;
  private blockService: BlockService;

  constructor() {
    this.transactionService = new TransactionService();
    this.blockService = new BlockService();
    this.wss = new WebSocketServer({ port: 8080 });

    this.wss.on('connection', (ws) => {
      console.log('WebSocket client connected');

      // Subscribe the client to transaction and block updates
      this.transactionService.on('newTransaction', (tx) => {
        ws.send(JSON.stringify({ type: 'transaction', data: tx }));
      });

      this.blockService.on('newBlock', (block) => {
        ws.send(JSON.stringify({ type: 'block', data: block }));
      });

      ws.on('close', () => {
        console.log('WebSocket client disconnected');
      });
    });

    console.log('WebSocket server started on port 8080');
  }
}