import LevelDB from 'leveldb';

const db = new LevelDB('faucet-db');

export const addFaucetRequest = async (address: string) => {
  await db.put(address, new Date().toISOString());
};

export const checkFaucetRequest = async (address: string) => {
  const lastRequest = await db.get(address);
  if (lastRequest) {
    const lastRequestDate = new Date(lastRequest);
    const now = new Date();
    const daysSinceLastRequest = (now.getTime() - lastRequestDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLastRequest < 1;
  }
  return false;
};