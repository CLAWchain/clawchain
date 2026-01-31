import { JsonRpcServer } from './rpc/server';
import { RpcMethods } from './rpc/methods';
import { ClawChain } from './chain';

class ClawChainApp {
  private rpcServer: JsonRpcServer;
  private rpcMethods: RpcMethods;
  private chain: ClawChain;

  constructor() {
    this.chain = new ClawChain();
    this.rpcServer = new JsonRpcServer();
    this.rpcMethods = new RpcMethods(this.rpcServer, this.chain);
  }

  async start() {
    console.log('ClawChain JSON-RPC server starting...');

    this.rpcServer.registerMethod('ping', () => Promise.resolve('pong'));

    const server = await this.rpcServer.start();
    console.log(`JSON-RPC server listening on port ${server.address().port}`);
  }
}

new ClawChainApp().start();