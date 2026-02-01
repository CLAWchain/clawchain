import { ethers } from 'ethers';

export function calculateContractAddress(
  senderAddress: string,
  nonce: number
): string {
  const address = ethers.utils.getContractAddress({
    from: senderAddress,
    nonce: nonce
  });
  return address;
}