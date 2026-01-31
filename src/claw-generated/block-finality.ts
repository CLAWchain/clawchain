import { Block } from './block';
import { getLatestBlock } from './blockchain';

const REQUIRED_CONFIRMATIONS = 6;

export async function trackBlockFinality() {
  const latestBlock = await getLatestBlock();
  latestBlock.incrementConfirmations();

  // Check if any previous blocks have reached finality
  const previousBlocks = await getPreviousBlocks(latestBlock.number);
  for (const block of previousBlocks) {
    block.incrementConfirmations();
  }
}

async function getPreviousBlocks(latestBlockNumber: number): Promise<Block[]> {
  const blocks: Block[] = [];
  for (let i = latestBlockNumber - 1; i >= Math.max(0, latestBlockNumber - REQUIRED_CONFIRMATIONS); i--) {
    const block = await getLatestBlock(i);
    blocks.push(block);
  }
  return blocks;
}