import { getDatabase, ref, set, get, child } from 'firebase/database';

// Assuming we're using Firebase Realtime Database
const database = getDatabase();

export const recordFaucetRequest = async (address: string): Promise<boolean> => {
  const requestsRef = ref(database, `faucet/requests/${address}`);
  const snapshot = await get(child(requestsRef, 'lastRequestTime'));

  if (snapshot.exists()) {
    const lastRequestTime = snapshot.val();
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    if (now - lastRequestTime < oneDay) {
      return true; // Address has already received tokens in the last 24 hours
    }
  }

  await set(requestsRef, { lastRequestTime: Date.now() });
  return false;
};