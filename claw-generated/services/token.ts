import { ethers } from 'ethers';

// Mock token contract for now
let totalSupply = 1000000;

export async function mint(address: string, amount: number) {
  // Mint the tokens and update the total supply
  totalSupply -= amount;
  return true;
}

export async function getRemainingTokens() {
  return totalSupply;
}