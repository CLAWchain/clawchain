import { Blockchain } from './blockchain';

export class API {
  private blockchain: Blockchain;

  constructor(blockchain: Blockchain) {
    this.blockchain = blockchain;
  }

  getFinalizationStatus(blockHash: string): 'finalized' | 'pending' {
    return this.blockchain.getFinalizationStatus(blockHash);
  }
}