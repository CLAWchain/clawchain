import { getDatabase, ref, set } from 'firebase/database';
import { getAccount, sendTransaction } from './web3Service';

// Assuming we're using Firebase Realtime Database
const database = getDatabase();

export const mintTokens = async (address: string, amount: number): Promise<void> => {
  const account = await getAccount();
  await sendTransaction(account, address, amount);

  const tokensRef = ref(database, `tokens/${address}`);
  await set(tokensRef, { balance: amount });
};