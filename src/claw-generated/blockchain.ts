import { getLatestBlock, getTransactionCount, getActiveAddressCount } from '../utils/chain';

export async function getTransactionVolume(): Promise<number> {
  const latestBlock = await getLatestBlock();
  return latestBlock.transactions.length / 5; // Assuming 5 second block time
}

export async function getBlockTime(): Promise<number> {
  const latestBlock = await getLatestBlock();
  const prevBlock = await getLatestBlock(latestBlock.number - 1);
  return (latestBlock.timestamp - prevBlock.timestamp);
}

export async function getDifficulty(): Promise<number> {
  const latestBlock = await getLatestBlock();
  return latestBlock.difficulty;
}

export async function getHashrate(): Promise<number> {
  const latestBlock = await getLatestBlock();
  return latestBlock.hashrate;
}

export async function getActiveAddresses(): Promise<number> {
  return await getActiveAddressCount();
}