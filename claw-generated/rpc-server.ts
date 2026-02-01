// claw-generated/rpc-server.ts
import { RPCMethod, RPCRequest, RPCResponse } from './rpc-types';

export class RPCServer {
  private methods: Record<string, RPCMethod> = {};

  registerMethod(name: string, method: RPCMethod) {
    this.methods[name] = method;
  }

  async handleRequest(request: RPCRequest): Promise<RPCResponse> {
    // TODO: Implement JSON-RPC 2.0 server logic
    throw new Error('Not implemented');
  }
}