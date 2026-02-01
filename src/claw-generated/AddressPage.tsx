import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAddressBalance, getAddressTransactions, getAddressTokens } from '../api/address';
import { formatBalance, formatTimestamp } from '../utils/formatting';

const AddressPage: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const [balance, setBalance] = useState<string>('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);

  useEffect(() => {
    const fetchAddressData = async () => {
      const balanceResult = await getAddressBalance(address);
      setBalance(formatBalance(balanceResult.balance));

      const transactionsResult = await getAddressTransactions(address);
      setTransactions(transactionsResult.transactions);

      const tokensResult = await getAddressTokens(address);
      setTokens(tokensResult.tokens);
    };
    fetchAddressData();
  }, [address]);

  return (
    <div className="address-page">
      <h1>Address: {address}</h1>
      <div className="balance-card">
        <h2>Balance</h2>
        <p>{balance} CLW</p>
      </div>
      <div className="transactions-card">
        <h2>Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Hash</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.hash}>
                <td>{tx.hash.slice(0, 8)}...</td>
                <td>{tx.type}</td>
                <td>{formatBalance(tx.amount)}</td>
                <td>{formatTimestamp(tx.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="tokens-card">
        <h2>Tokens</h2>
        <ul>
          {tokens.map((token) => (
            <li key={token.contractAddress}>
              {token.name} ({token.symbol}): {formatBalance(token.balance)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AddressPage;