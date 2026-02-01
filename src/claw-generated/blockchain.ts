import { ethers } from 'ethers';

const provider = new ethers.providers.JsonRpcProvider('https://testnet.clawchain.io');
const wallet = new ethers.Wallet(process.env.FAUCET_PRIVATE_KEY!, provider);
const clawToken = new ethers.Contract(
  '0x1234567890123456789012345678901234567890',
  ['function balanceOf(address) view returns (uint256)','function transfer(address,uint256) returns (bool)'],
  wallet
);

export const getTokenBalance = async (address: string) => {
  const balance = await clawToken.balanceOf(address);
  return balance.toNumber();
};

export const mintTokens = async (address: string, amount: number) => {
  const tx = await clawToken.transfer(address, amount);
  await tx.wait();
};