import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getBalance, getTransactions, getTokenBalances } from './api';

const AddressPage: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const [balance, setBalance] = useState<string>('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [tokenBalances, setTokenBalances] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setBalance(await getBalance(address));
      setTransactions(await getTransactions(address));
      setTokenBalances(await getTokenBalances(address));
    };
    fetchData();
  }, [address]);

  return (
    <div>
      <h1>Address: {address}</h1>
      <div>Balance: {balance}</div>
      <h2>Transactions</h2>
      <ul>
        {transactions.map((tx, index) => (
          <li key={index}>{tx.hash}</li>
        ))}
      </ul>
      <h2>Token Balances</h2>
      <ul>
        {tokenBalances.map((token, index) => (
          <li key={index}>{token.symbol}: {token.balance}</li>
        ))}
      </ul>
    </div>
  );
};

export default AddressPage;