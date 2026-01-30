import { Transaction } from '../types';
import { getTransaction as dbGetTransaction } from '../db';

export async function getTransaction(signature: string): Promise<Transaction | null> {
  return await dbGetTransaction(signature);
}