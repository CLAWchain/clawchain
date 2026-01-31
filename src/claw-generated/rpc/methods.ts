import { JsonRpcServer } from './server';
import { ClawChain } from '../chain';

class RpcMethods {
  private chain: ClawChain;

  constructor(private rpcServer: JsonRpcServer, chain: ClawChain) {
    this.chain = chain;

    this.registerMethods();
  }

  private registerMethods() {
    this.rpcServer.registerMethod('clawchain_getBalance', this.getBalance);
    this.rpcServer.registerMethod('clawchain_sendTransaction', this.sendTransaction);
    this.rpcServer.registerMethod('clawchain_getTransactionReceipt', this.getTransactionReceipt);
    this.rpcServer.registerMethod('clawchain_call', this.call);
  }

  private async getBalance(address: string): Promise<string> {
    const balance = await this.chain.getBalance(address);
    return balance.toString();
  }

  private async sendTransaction(
    from: string,
    to: string,
    value: string,
    data: string
  ): Promise<string> {
    const txHash = await this.chain.sendTransaction(from, to, value, data);
    return txHash;
  }

  private async getTransactionReceipt(txHash: string): Promise<any> {
    const receipt = await this.chain.getTransactionReceipt(txHash);
    return receipt;
  }

  private async call(
    from: string,
    to: string,
    value: string,
    data: string
  ): Promise<string> {
    const result = await this.chain.call(from, to, value, data);
    return result;
  }
}

export { RpcMethods };