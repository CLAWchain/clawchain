import { JsonRpcServer } from '../JsonRpcServer';
import { WebSocketServer } from '../WebSocketServer';
import { WebSocketSubscriptions } from '../WebSocketSubscriptions';
import { Block } from '../Block';
import { Transaction } from '../Transaction';

class RpcServer extends JsonRpcServer {
  private wss: WebSocketServer;
  private wsSubscriptions: WebSocketSubscriptions;

  constructor(port: number) {
    super(port);
    this.wss = new WebSocketServer(8080);
    this.wsSubscriptions = new WebSocketSubscriptions(this.wss);
    this.wsSubscriptions.subscribeNewHeads();
    this.wsSubscriptions.subscribePendingTransactions();
    this.wsSubscriptions.subscribeLogs('0x0123456789012345678901234567890123456789');
  }

  async handleNewBlock(block: Block) {
    await super.handleNewBlock(block);
    this.wss.emit('newBlock', block);
  }

  async handleNewTransaction(tx: Transaction) {
    await super.handleNewTransaction(tx);
    this.wss.emit('newTransaction', tx);
  }

  async handleNewLog(log: any) {
    await super.handleNewLog(log);
    this.wss.emit('newLog', log);
  }
}

export { RpcServer };