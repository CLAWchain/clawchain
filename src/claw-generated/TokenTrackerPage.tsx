import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const GET_CRC20_TOKENS = gql`
  query GetCRC20Tokens {
    crc20Tokens {
      address
      name
      symbol
      totalSupply
      holders
      transfers(last: 10) {
        from
        to
        amount
        timestamp
      }
    }
  }
`;

const TokenTrackerPage: React.FC = () => {
  const { loading, error, data } = useQuery(GET_CRC20_TOKENS);
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    if (data && data.crc20Tokens) {
      setTokens(data.crc20Tokens);
    }
  }, [data]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Token Tracker</h1>
      <table>
        <thead>
          <tr>
            <th>Token</th>
            <th>Address</th>
            <th>Total Supply</th>
            <th>Holders</th>
            <th>Recent Transfers</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr key={token.address}>
              <td>{token.name} ({token.symbol})</td>
              <td>{token.address}</td>
              <td>{token.totalSupply}</td>
              <td>{token.holders}</td>
              <td>
                <ul>
                  {token.transfers.map((transfer, index) => (
                    <li key={index}>
                      {transfer.from} → {transfer.to}: {transfer.amount} ({transfer.timestamp})
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