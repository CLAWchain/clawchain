import WebSocket from 'ws';
import WebSocketServer from './WebSocketServer';
import webSocketServer from './WebSocketSubscriptions';

describe('WebSocketServer', () => {
  let wss: WebSocketServer;

  beforeEach(() => {
    wss = new WebSocketServer();
  });

  test('should handle WebSocket connection and message', (done) => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.on('open', () => {
      ws.send(JSON.stringify({ jsonrpc: '2.0', method: 'newHeads', params: {} }));
    });
    ws.on('message', (data) => {
      const response = JSON.parse(data.toString());
      expect(response).toHaveProperty('jsonrpc', '2.0');
      expect(response).toHaveProperty('method', 'newHeads');
      expect(response).toHaveProperty('params');
      done();
    });
  });

  test('should broadcast updates to subscribed clients', (done) => {
    const ws1 = new WebSocket('ws://localhost:8080');
    const ws2 = new WebSocket('ws://localhost:8080');

    let messagesReceived = 0;
    const onMessage = () => {
      messagesReceived++;
      if (messagesReceived === 2) {
        done();
      }
    };

    ws1.on('open', () => {
      ws1.on('message', onMessage);
      ws1.send(JSON.stringify({ jsonrpc: '2.0', method: 'newHeads', params: {} }));
    });

    ws2.on('open', () => {
      ws2.on('message', onMessage);
      ws2.send(JSON.stringify({ jsonrpc: '2.0', method: 'newHeads', params: {} }));
    });
  });
});