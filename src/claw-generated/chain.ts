import { Block } from '../blockchain/types';

let chainTip: Block;
let chainHeight: number;

/**
 * Sets the current chain tip.
 * @param block The new chain tip block.
 */
export function setChainTip(block: Block) {
  chainTip = block;
}

/**
 * Sets the current chain height.
 * @param height The new chain height.
 */
export function setChainHeight(height: number) {
  chainHeight = height;
}

/**
 * Gets the current chain tip block.
 * @returns The current chain tip block.
 */
export function getChainTipHash(): string {
  return chainTip.hash;
}

/**
 * Gets the current chain height.
 * @returns The current chain height.
 */
export function getChainTipHeight(): number {
  return chainHeight;
}