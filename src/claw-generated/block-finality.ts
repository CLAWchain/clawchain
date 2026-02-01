import { config } from './config';

type FinalityStatus = 'pending' | 'finalized';

interface BlockStatus {
  finalized: boolean;
  confirmations: number;
}

const finalizedBlocks: Map<string, BlockStatus> = new Map();
const pendingBlocks: Map<string, BlockStatus> = new Map();

export function processBlockForFinality(block: Block): FinalityStatus {
  const { hash } = block;
  const currentStatus = finalizedBlocks.get(hash) || pendingBlocks.get(hash);

  if (currentStatus) {
    const { confirmations, finalized } = currentStatus;
    if (finalized) {
      return 'finalized';
    } else if (confirmations >= config.finalityDepth) {
      finalizedBlocks.set(hash, { confirmations, finalized: true });
      pendingBlocks.delete(hash);
      return 'finalized';
    } else {
      pendingBlocks.set(hash, { confirmations: confirmations + 1, finalized: false });
      return 'pending';
    }
  } else {
    pendingBlocks.set(hash, { confirmations: 1, finalized: false });
    return 'pending';
  }
}

export function getBlockFinalityStatus(hash: string): FinalityStatus {
  const finalizedBlock = finalizedBlocks.get(hash);
  if (finalizedBlock) {
    return 'finalized';
  }
  const pendingBlock = pendingBlocks.get(hash);
  if (pendingBlock) {
    return 'pending';
  }
  return 'pending';
}