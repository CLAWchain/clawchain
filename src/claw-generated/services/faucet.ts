import { db } from '../db';

export const trackFaucetRequest = async (address: string): Promise<boolean> => {
  const lastClaimDate = await db.getFaucetClaimDate(address);
  const today = new Date().toISOString().slice(0, 10);

  if (lastClaimDate === today) {
    return true; // Address has already claimed today
  }

  await db.recordFaucetClaim(address, today);
  return false;
};