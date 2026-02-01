import React, { useState, useEffect } from 'react';
import { fetchTokenContracts, getTokenDetails } from './tokenService';

interface TokenDetails {
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
}

const TokenTrackerPage = () => {
  const [tokens, setTokens] = useState<TokenDetails[]>([]);

  useEffect(() => {
    const fetchTokenData = async () => {
      const tokenContracts = await fetchTokenContracts();
      const tokenDetails = await Promise.all(
        tokenContracts.map(async (contract) => await getTokenDetails(contract))
      );
      setTokens(tokenDetails);
    };
    fetchTokenData();
  }, []);

  return (
    <div>
      <h1>Token Tracker</h1>
      <table>
        <thead>
          <tr>
            <th>Token</th>
            <th>Total Supply</th>
            <th>Holders</th>
            <th>Recent Transfers</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr key={token.address}>
              <td>{token.name} ({token.symbol})</td>
              <td>{token.totalSupply}</td>
              <td>{token.numHolders}</td>
              <td>
                <ul>
                  {token.recentTransfers.map((transfer, index) => (
                    <li key={index}>
                      {transfer.from} → {transfer.to}: {transfer.amount}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TokenTrackerPage;