import React, { useState, useEffect } from 'react';
import { AccountAPI } from './account-api';

export const WalletUI = () => {
  const [balance, setBalance] = useState(0);
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const api = new AccountAPI();
    const address = '0x1234567890abcdef';
    setBalance(api.getBalance(address));
    setTransactionHistory(api.getTransactionHistory(address));
    setPendingTransactions(api.getPendingTransactions(address));
  }, []);

  return (
    <div>
      <h1>Wallet</h1>
      <p>Balance: {balance} CLAW</p>
      <h2>Transaction History</h2>
      <ul>
        {transactionHistory.map((tx, index) => (
          <li key={index}>
            {tx.sender} -> {tx.recipient}: {tx.amount} CLAW ({tx.status})
          </li>
        ))}
      </ul>
      <h2>Pending Transactions</h2>
      <ul>
        {pendingTransactions.map((tx, index) => (
          <li key={index}>
            {tx.sender} -> {tx.recipient}: {tx.amount} CLAW
          </li>
        ))}
      </ul>
    </div>
  );
};