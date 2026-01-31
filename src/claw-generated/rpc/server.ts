import { RPC_METHODS } from './methods';

export class JsonRpcServer {
  // ... existing code ...

  handleRequest(method: string, params: any[]) {
    switch (method) {
      case 'getBalance':
        return RPC_METHODS.getBalance(params[0]);
      // ... handle other methods ...
      default:
        throw new Error(`Unknown RPC method: ${method}`);
    }
  }
}