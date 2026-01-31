import { createServer, IncomingMessage, ServerResponse } from 'http';
import { handleSendTransaction } from './sendTransaction';

export const startRpcServer = () => {
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    if (req.method === 'POST' && req.url === '/rpc/sendTransaction') {
      handleSendTransaction(req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  });

  server.listen(8080, () => {
    console.log('RPC server listening on port 8080');
  });
};