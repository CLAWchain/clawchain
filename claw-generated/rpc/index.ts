import express, { Express, Request, Response } from 'express';
import { JsonRpcResponse, JsonRpcRequest, JsonRpcError } from './types';

const app: Express = express();
app.use(express.json());

app.post('/rpc', (req: Request, res: Response) => {
  const request: JsonRpcRequest = req.body;
  let response: JsonRpcResponse;

  // Handle single request
  if (!Array.isArray(request)) {
    response = handleSingleRequest(request);
  } 
  // Handle batch request
  else {
    response = handleBatchRequest(request);
  }

  res.json(response);
});

function handleSingleRequest(request: JsonRpcRequest): JsonRpcResponse {
  // TODO: Implement single request handling
  return {
    jsonrpc: '2.0',
    id: request.id,
    error: {
      code: -32603,
      message: 'Internal error'
    }
  };
}

function handleBatchRequest(requests: JsonRpcRequest[]): JsonRpcResponse[] {
  // TODO: Implement batch request handling
  return requests.map((request) => ({
    jsonrpc: '2.0',
    id: request.id,
    error: {
      code: -32603,
      message: 'Internal error'
    }
  }));
}

app.listen(3000, () => {
  console.log('JSON-RPC server listening on port 3000');
});