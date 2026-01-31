import { IncomingMessage, ServerResponse } from 'http';
import { parseJSON, validateAndBroadcastTransaction } from './utils';

export const handleSendTransaction = async (req: IncomingMessage, res: ServerResponse) => {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });
  req.on('end', async () => {
    const jsonRpcRequest = parseJSON(body);
    if (!jsonRpcRequest || !jsonRpcRequest.params || !jsonRpcRequest.params.length) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid request' }));
      return;
    }

    const [signedTransaction] = jsonRpcRequest.params;
    try {
      await validateAndBroadcastTransaction(signedTransaction);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ result: 'Transaction accepted' }));
    } catch (err) {
      console.error('Error handling sendTransaction:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to process transaction' }));
    }
  });
};