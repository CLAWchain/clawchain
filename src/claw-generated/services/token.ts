import { db } from '../db';

export const mintTokens = async (address: string, amount: number): Promise<void> => {
  await db.mintTokens(address, amount);
};