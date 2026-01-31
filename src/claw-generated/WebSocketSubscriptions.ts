import WebSocket from 'ws';
import WebSocketServer from './WebSocketServer';

const webSocketServer = new WebSocketServer();

webSocketServer.registerSubscription('newHeads', (params, ws) => {
  // Broadcast new block headers to subscribed clients
  const blockHeader = {
    number: 1234,
    hash: '0x1234567890abcdef',
    parentHash: '0x0987654321fedcba',
    // Add more block header properties
  };
  ws.send(JSON.stringify({ jsonrpc: '2.0', method: 'newHeads', params: blockHeader }));
});

webSocketServer.registerSubscription('logs', (params, ws) => {
  // Broadcast log events to subscribed clients
  const logEvent = {
    address: '0x0123456789012345678901234567890123456789',
    topics: ['0x0123456789012345678901234567890123456789012345678901234567890123'],
    data: '0x0123456789012345678901234567890123456789012345678901234567890123',
    // Add more log event properties
  };
  ws.send(JSON.stringify({ jsonrpc: '2.0', method: 'logs', params: logEvent }));
});

webSocketServer.registerSubscription('pendingTransactions', (params, ws) => {
  // Broadcast pending transactions to subscribed clients
  const pendingTx = {
    hash: '0x0123456789012345678901234567890123456789012345678901234567890123',
    from: '0x0123456789012345678901234567890123456789',
    to: '0x9876543210987654321098765432109876543210',
    value: '0x0123456789012345',
    // Add more transaction properties
  };
  ws.send(JSON.stringify({ jsonrpc: '2.0', method: 'pendingTransactions', params: pendingTx }));
});

export default webSocketServer;