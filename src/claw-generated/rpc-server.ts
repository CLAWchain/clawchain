import Blockchain from './blockchain';

class RPCServer {
  private blockchain: Blockchain;

  constructor(blockchain: Blockchain) {
    this.blockchain = blockchain;
  }

  getBlockFinality(blockHash: string): number {
    return this.blockchain.getBlockFinality(blockHash);
  }

  start(): void {
    // Expose the getBlockFinality method as an RPC endpoint
    this.registerRPCMethod('getBlockFinality', this.getBlockFinality.bind(this));

    // Start the RPC server
    // ...
  }

  private registerRPCMethod(name: string, handler: (params: any) => any): void {
    // Implement RPC method registration
  }
}

export default RPCServer;