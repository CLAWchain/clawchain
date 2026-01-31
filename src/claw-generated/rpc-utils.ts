import { IncomingMessage } from 'http';

export async function parseJsonRpcRequest(req: IncomingMessage): Promise<any> {
  let body = '';
  for await (const chunk of req) {
    body += chunk.toString();
  }
  return JSON.parse(body);
}

export async function handleJsonRpcRequest(request: any): Promise<any> {
  const { id, method, params } = request;
  switch (method) {
    case 'sendTransaction':
      return await handleSendTransaction(params);
    default:
      throw new Error(`Unknown RPC method: ${method}`);
  }
}

async function handleSendTransaction(params: any): Promise<any> {
  // TODO: Implement sendTransaction logic
  return { id, result: 'Transaction accepted' };
}