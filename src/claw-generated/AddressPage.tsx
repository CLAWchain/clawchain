import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAddressBalance, getAddressTransactions, getAddressTokenBalances } from './api/blockchain';
import { formatEther, formatTokenBalance } from './utils';
import { Transaction, Token } from './types';
import './AddressPage.scss';

const AddressPage: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const [balance, setBalance] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tokenBalances, setTokenBalances] = useState<Token[]>([]);

  useEffect(() => {
    const fetchAddressData = async () => {
      const balanceResult = await getAddressBalance(address);
      setBalance(formatEther(balanceResult.balance));

      const transactionsResult = await getAddressTransactions(address);
      setTransactions(transactionsResult.transactions);

      const tokenBalancesResult = await getAddressTokenBalances(address);
      setTokenBalances(tokenBalancesResult.balances);
    };

    fetchAddressData();
  }, [address]);

  return (
    <div className="address-page">
      <h1>Address: {address}</h1>
      <div className="address-info">
        <div className="balance-summary">
          <h2>Balance</h2>
          <p>{balance} CLAW</p>
        </div>
        <div className="transaction-history">
          <h2>Transactions</h2>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Block</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, index) => (
                <tr key={index}>
                  <td>{tx.type}</td>
                  <td>{formatEther(tx.value)} CLAW</td>
                  <td>{tx.block}</td>
                  <td>{new Date(tx.timestamp * 1000).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="token-holdings">
          <h2>Token Holdings</h2>
          <table>
            <thead>
              <tr>
                <th>Token</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {tokenBalances.map((token, index) => (
                <tr key={index}>
                  <td>{token.symbol}</td>
                  <td>{formatTokenBalance(token.balance, token.decimals)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AddressPage;