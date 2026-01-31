import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CRCTOKEN } from './CRCTOKEN.sol';

interface Token {
  name: string;
  symbol: string;
  totalSupply: number;
  holders: number;
  recentTransfers: {
    from: string;
    to: string;
    value: number;
    timestamp: number;
  }[];
}

const TokenTrackerPage: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the list of all CRC-20 contract addresses
        const contractAddresses = await fetchCRC20Contracts();

        // Fetch the token data for each contract
        const tokenData = await Promise.all(
          contractAddresses.map(async (address) => {
            const token = await fetchTokenData(address);
            return token;
          })
        );

        setTokens(tokenData);
        setLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  return (
    <div>
      <h1>Token Tracker</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Symbol</th>
              <th>Total Supply</th>
              <th>Holders</th>
              <th>Recent Transfers</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token, index) => (
              <tr key={index}>
                <td>{token.name}</td>
                <td>{token.symbol}</td>
                <td>{token.totalSupply}</td>
                <td>{token.holders}</td>
                <td>
                  <ul>
                    {token.recentTransfers.map((transfer, i) => (
                      <li key={i}>
                        {transfer.from} → {transfer.to}: {transfer.value}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

async function fetchCRC20Contracts(): Promise<string[]> {
  // Implement logic to fetch the list of all deployed CRC-20 contracts
  // This could involve querying the chain state or an event log
  return ['0x1234567890abcdef', '0x0987654321fedcba'];
}

async function fetchTokenData(address: string): Promise<Token> {
  const provider = new ethers.providers.JsonRpcProvider();
  const contract = new ethers.Contract(address, CRCTOKEN.abi, provider);

  const [name, symbol, decimals, totalSupply] = await Promise.all([
    contract.name(),
    contract.symbol(),
    contract.decimals(),
    contract.totalSupply(),
  ]);

  const holders = await getHolderCount(address);
  const recentTransfers = await getRecentTransfers(address);

  return {
    name,
    symbol,
    totalSupply: Number(ethers.utils.formatUnits(totalSupply, decimals)),
    holders,
    recentTransfers,
  };
}

async function getHolderCount(address: string): Promise<number> {
  // Implement logic to fetch the number of token holders for the given contract address
  return 100;
}

async function getRecentTransfers(address: string): Promise<
  { from: string; to: string; value: number; timestamp: number }[]
> {
  // Implement logic to fetch the most recent token transfers for the given contract address
  return [
    { from: '0x1234', to: '0x5678', value: 100, timestamp: Date.now() },
    { from: '0x5678', to: '0x9012', value: 50, timestamp: Date.now() - 3600000 },
  ];
}

export default TokenTrackerPage;