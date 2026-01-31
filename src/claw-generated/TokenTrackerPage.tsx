import React, { useState, useEffect } from 'react';
import { getTokens, getTokenHolders, getTokenTransfers } from '../explorer/api';

interface Token {
  address: string;
  name: string;
  symbol: string;
  totalSupply: string;
  holderCount: number;
  transfers: {
    from: string;
    to: string;
    value: string;
    timestamp: number;
  }[];
}

const TokenTrackerPage: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);

  useEffect(() => {
    const fetchTokenData = async () => {
      const tokenList = await getTokens();
      const tokenData = await Promise.all(
        tokenList.map(async (token) => {
          const [holders, transfers] = await Promise.all([
            getTokenHolders(token.address),
            getTokenTransfers(token.address),
          ]);
          return {
            ...token,
            holderCount: holders.length,
            transfers: transfers.slice(0, 10),
          };
        })
      );
      setTokens(tokenData);
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
              <td>{token.holderCount}</td>
              <td>
                <ul>
                  {token.transfers.map((transfer, i) => (
                    <li key={i}>
                      {transfer.from} → {transfer.to} ({transfer.value})
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