import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAddressBalance, getAddressTransactions, getAddressTokenBalances } from '../api/blockchain';

const AddressPage: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const [balance, setBalance] = useState<string>('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [tokenBalances, setTokenBalances] = useState<any[]>([]);

  useEffect(() => {
    const fetchAddressData = async () => {
      const balanceResult = await getAddressBalance(address);
      setBalance(balanceResult.balance);

      const transactionsResult = await getAddressTransactions(address);
      setTransactions(transactionsResult.transactions);

      const tokenBalancesResult = await getAddressTokenBalances(address);
      setTokenBalances(tokenBalancesResult.balances);
    };

    fetchAddressData();
  }, [address]);

  return (
    <div>
      <h1>Address: {address}</h1>
      <p>Balance: {balance} CLAW</p>
      <h2>Transactions</h2>
      <ul>
        {transactions.map((tx, index) => (
          <li key={index}>
            {tx.timestamp} - {tx.value} CLAW
          </li>
        ))}
      </ul>
      <h2>Token Holdings</h2>
      <ul>
        {tokenBalances.map((token, index) => (
          <li key={index}>
            {token.symbol}: {token.balance}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddressPage;