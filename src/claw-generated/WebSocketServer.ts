import { IncomingMessage, ServerResponse } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import JsonRpcServer from './JsonRpcServer';

class WebSocketServer extends JsonRpcServer {
  private wss: WebSocketServer;

  constructor() {
    super();
    this.wss = new WebSocketServer({ port: 8080 });
    this.wss.on('connection', (ws, req) => {
      console.log('WebSocket connection established');
      ws.on('message', (data) => {
        this.handleWebSocketMessage(ws, data.toString());
      });
    });
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
}

export default WebSocketServer;