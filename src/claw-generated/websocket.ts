import WebSocket from 'ws';
import { logger } from '../utils/logger';
import { getLatestBlock, subscribeToLogs, subscribeToPendingTransactions } from '../blockchain';

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  logger.info('WebSocket client connected');

  ws.on('message', (message) => {
    try {
      const { type, data } = JSON.parse(message);
      switch (type) {
        case 'newHeads':
          ws.send(JSON.stringify({ type: 'newHeads', data: getLatestBlock() }));
          break;
        case 'logs':
          subscribeToLogs(data, (logs) => {
            ws.send(JSON.stringify({ type: 'logs', data: logs }));
          });
          break;
        case 'pendingTransactions':
          subscribeToPendingTransactions((transactions) => {
            ws.send(JSON.stringify({ type: 'pendingTransactions', data: transactions }));
          });
          break;
        default:
          logger.warn(`Unsupported subscription type: ${type}`);
      }
    } catch (err) {
      logger.error(`Error handling WebSocket message: ${err}`);
    }
  });

  ws.on('close', () => {
    logger.info('WebSocket client disconnected');
  });
});

logger.info('WebSocket server started');