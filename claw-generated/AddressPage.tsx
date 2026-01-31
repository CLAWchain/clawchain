import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAddressBalance, getAddressTransactions, getAddressTokens } from '../api/address';
import { Transaction, Token } from '../types';

const AddressPage: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const [balance, setBalance] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);

  useEffect(() => {
    const fetchAddressData = async () => {
      const balanceResult = await getAddressBalance(address);
      setBalance(balanceResult.balance);

      const transactionsResult = await getAddressTransactions(address);
      setTransactions(transactionsResult.transactions);

      const tokensResult = await getAddressTokens(address);
      setTokens(tokensResult.tokens);
    };
    fetchAddressData();
  }, [address]);

  return (
    <div>
      <h1>Address: {address}</h1>
      <p>Balance: {balance} CLAW</p>
      <h2>Transactions</h2>
      <ul>
        {transactions.map((tx) => (
          <li key={tx.hash}>
            <p>Hash: {tx.hash}</p>
            <p>Value: {tx.value} CLAW</p>
            <p>Block: {tx.block}</p>
          </li>
        ))}
      </ul>
      <h2>Tokens</h2>
      <ul>
        {tokens.map((token) => (
          <li key={token.contract}>
            <p>Contract: {token.contract}</p>
            <p>Balance: {token.balance}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddressPage;