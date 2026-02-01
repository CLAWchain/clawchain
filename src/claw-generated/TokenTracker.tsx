import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const GET_TOKEN_LIST = gql`
  query {
    tokens {
      id
      name
      symbol
      totalSupply
      holders
      transfers(limit: 10, orderBy: timestamp, orderDirection: desc) {
        id
        from
        to
        value
        timestamp
      }
    }
  }
`;

interface Token {
  id: string;
  name: string;
  symbol: string;
  totalSupply: string;
  holders: number;
  transfers: {
    id: string;
    from: string;
    to: string;
    value: string;
    timestamp: string;
  }[];
}

const TokenTracker: React.FC = () => {
  const { loading, error, data } = useQuery<{ tokens: Token[] }>(GET_TOKEN_LIST);
  const [tokens, setTokens] = useState<Token[]>([]);

  useEffect(() => {
    if (data) {
      setTokens(data.tokens);
    }
  }, [data]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>Token Tracker</h1>
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
          {tokens.map((token) => (
            <tr key={token.id}>
              <td>{token.name}</td>
              <td>{token.symbol}</td>
              <td>{token.totalSupply}</td>
              <td>{token.holders}</td>
              <td>
                <ul>
                  {token.transfers.map((transfer) => (
                    <li key={transfer.id}>
                      {transfer.from} -> {transfer.to} ({transfer.value})
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

export default TokenTracker;