import { processBlockForFinality } from './block-finality';
import { Block } from '../types';

export function processBlock(block: Block): void {
  const finalityStatus = processBlockForFinality(block);
  console.log(`Block ${block.hash} is ${finalityStatus}`);
  // other block processing logic...
}