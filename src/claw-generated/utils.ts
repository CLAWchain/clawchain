import { keccak256 } from 'js-sha3';

export function getContractAddress(creatorAddress: string, nonce: number): string {
  const input = `${creatorAddress}:${nonce}`;
  const hash = keccak256(input);
  return `0x${hash.slice(64 - 40)}`;
}