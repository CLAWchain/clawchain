import { createServer, IncomingMessage, ServerResponse } from 'http';
import { parseJsonRpcRequest, handleJsonRpcRequest } from './rpc-utils';

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  if (req.method === 'POST' && req.url === '/rpc') {
    try {
      const request = await parseJsonRpcRequest(req);
      const response = await handleJsonRpcRequest(request);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(response));
    } catch (err) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: err.message }));
    }
  } else {
    res.statusCode = 404;
    res.end();
  }
});

server.listen(8080, () => {
  console.log('RPC server listening on port 8080');
});