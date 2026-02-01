import Blockchain from './blockchain';
import { AccountState } from './account';

class RPCServer {
  private blockchain: Blockchain;

  constructor(blockchain: Blockchain) {
    this.blockchain = blockchain;
  }

  getBlockFinality(blockHash: string): number {
    return this.blockchain.getBlockFinality(blockHash);
  }

  getBalance(pubkey: string): number {
    const account = this.blockchain.getAccount(pubkey);
    return account ? account.balance : 0;
  }

  start(): void {
    // Expose the getBlockFinality method as an RPC endpoint
    this.registerRPCMethod('getBlockFinality', this.getBlockFinality.bind(this));

    // Expose the getBalance method as an RPC endpoint
    this.registerRPCMethod('getBalance', this.getBalance.bind(this));

    // Start the RPC server
    // ...
  }

  private registerRPCMethod(name: string, handler: (params: any) => any): void {
    // Implement RPC method registration
  }
}

export default RPCServer;