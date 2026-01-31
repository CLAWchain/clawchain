import { RpcMethods } from './methods';

export class RpcServer {
  async handleRequest(method: string, params: any): Promise<any> {
    if (RpcMethods[method]) {
      return await RpcMethods[method](params);
    } else {
      throw new Error(`Unknown RPC method: ${method}`);
    }
  }
}