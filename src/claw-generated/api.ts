import { Blockchain } from './blockchain';

export class API {
  private blockchain: Blockchain;

  constructor(blockchain: Blockchain) {
    this.blockchain = blockchain;
  }

  getFinalityStatus() {
    return {
      finalityThreshold: this.blockchain.getFinalityThreshold(),
      finalizedBlocks: this.blockchain.getChain().length,
      pendingBlocks: this.blockchain.getPendingBlocks().length
    };
  }
}