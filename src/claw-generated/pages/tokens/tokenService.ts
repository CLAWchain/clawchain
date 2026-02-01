import { Contract, providers } from 'ethers';
import { ContractStorage } from '../contracts/ContractStorage.sol';

export async function fetchTokenContracts(): Promise<string[]> {
  // Fetch the list of deployed CRC-20 token contracts
  const contractStorage = new Contract(
    ContractStorage.address,
    ContractStorage.abi,
    providers.getDefaultProvider()
  );

  const tokenContractAddresses = await contractStorage.getTokenContractAddresses();
  return tokenContractAddresses;
}

export async function getTokenDetails(tokenAddress: string): Promise<{
  address: string;
  name: string;
  symbol: string;
  totalSupply: number;
  numHolders: number;
  recentTransfers: Array<{
    from: string;
    to: string;
    amount: number;
    timestamp: number;
  }>;
}> {
  // Fetch the details for the specified token contract
  const tokenContract = new Contract(tokenAddress, ContractStorage.TokenABI, providers.getDefaultProvider());

  const [name, symbol, totalSupply, numHolders, recentTransfers] = await Promise.all([
    tokenContract.name(),
    tokenContract.symbol(),
    tokenContract.totalSupply(),
    tokenContract.numHolders(),
    fetchRecentTransfers(tokenAddress),
  ]);

  return {
    address: tokenAddress,
    name,
    symbol,
    totalSupply: totalSupply.toNumber(),
    numHolders: numHolders.toNumber(),
    recentTransfers,
  };
}

async function fetchRecentTransfers(tokenAddress: string): Promise<
  Array<{
    from: string;
    to: string;
    amount: number;
    timestamp: number;
  }>
> {
  // Fetch the recent transfer events for the specified token contract
  // and return them in the desired format
  // ...
  return [
    {
      from: '0x1234567890abcdef',
      to: '0x0987654321fedcba',
      amount: 100,
      timestamp: Date.now() - 3600000, // 1 hour ago
    },
    {
      from: '0x0987654321fedcba',
      to: '0x1234567890abcdef',
      amount: 50,
      timestamp: Date.now() - 7200000, // 2 hours ago
    },
  ];
}