import { Blockchain } from '../blockchain';
import { Block } from '../blockchain/block';

export class JsonRpcMethods {
  constructor(
    private faucetService: FaucetService,
    private tokenService: TokenService,
    private blockchain: Blockchain
  ) {}

  async getBlockFinality(params: { blockHash: string }): Promise<{ finalized: boolean }> {
    const block = this.blockchain.getBlockByHash(params.blockHash);
    if (!block) {
      throw new Error('Block not found');
    }
    return { finalized: block.finalized };
  }

  // Other RPC methods...
}