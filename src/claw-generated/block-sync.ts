import { Block } from './block';
import { BlockchainService } from '../db/blockchain-service';

export async function handleGetBlocksRequest(request: { hashes: string[] }): Promise<{ blocks: { hash: string, data: string }[] }> {
  const blockchain = new BlockchainService();
  const blocks = await Promise.all(request.hashes.map(async (hash) => {
    const block = await blockchain.getBlock(hash);
    return {
      hash,
      data: Block.encode(block).toString('base64')
    };
  }));
  return { blocks };
}