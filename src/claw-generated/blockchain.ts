import { getLatestBlock, getTransactionsByAddress, getTokenBalancesByAddress } from './blockchainService';

export const getAddressBalance = async (address: string) => {
  const latestBlock = await getLatestBlock();
  const balance = latestBlock.accounts[address]?.balance || '0';
  return { balance };
};

export const getAddressTransactions = async (address: string) => {
  const transactions = await getTransactionsByAddress(address);
  return { transactions };
};

export const getAddressTokenBalances = async (address: string) => {
  const tokenBalances = await getTokenBalancesByAddress(address);
  return { balances: tokenBalances };
};