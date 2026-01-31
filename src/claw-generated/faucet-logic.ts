// Faucet logic
import { getDispensedAddresses, storeDispensedAddress } from './faucet-db';
import { mintTokens } from './token-minting';

export async function dispenseTokens(address: string): Promise<number> {
  // Check if address has already claimed tokens today
  const dispensed = await getDispensedAddresses();
  if (dispensed.includes(address)) {
    throw new Error('Address has already claimed tokens today');
  }

  // Mint 10 CLAW tokens for the address
  await mintTokens(address, 10);

  // Store the address in the dispensed list
  await storeDispensedAddress(address);

  return 10;
}