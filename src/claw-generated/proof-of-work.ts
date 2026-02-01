import { keccak256 } from 'js-sha3';

export async function createProofOfWork(address: string, nonce: number, difficulty: number): Promise<boolean> {
  const target = '0'.repeat(difficulty) + 'f'.repeat(64 - difficulty);
  const hash = keccak256(`${address}:${nonce}`);
  return hash < target;
}