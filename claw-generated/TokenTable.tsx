import React, { useState, useEffect } from 'react';
import { fetchTokens, TokenInfo } from '../api/tokens';

const TokenTable: React.FC = () => {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const tokenData = await fetchTokens();
      setTokens(tokenData);
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2>Token Tracker</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Symbol</th>
            <th>Total Supply</th>
            <th>Holders</th>
            <th>Transfers</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr key={token.address}>
              <td>{token.name}</td>
              <td>{token.symbol}</td>
              <td>{token.totalSupply}</td>
              <td>{token.holderCount}</td>
              <td>{token.recentTransfers.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TokenTable;