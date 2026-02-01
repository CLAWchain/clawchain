import React, { useState, useEffect } from 'react';
import { Transaction } from './transaction';
import { WebSocketConnection } from '../websocket';

interface TransactionFeedProps {
  walletAddress: Uint8Array;
}

const TransactionFeed: React.FC<TransactionFeedProps> = ({ walletAddress }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const ws = new WebSocketConnection('/transactions');
    ws.onMessage((data) => {
      const newTransaction = Transaction.fromJSON(data);
      setTransactions((prevTransactions) => [newTransaction, ...prevTransactions]);
    });

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="transaction-feed">
      <h2>Real-Time Transaction Feed</h2>
      <table>
        <thead>
          <tr>
            <th>Sender</th>
            <th>Recipient</th>
            <th>Amount</th>
            <th>Fee</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, index) => (
            <tr key={index}>
              <td>{tx.senderAddress}</td>
              <td>{tx.recipientAddress}</td>
              <td>{tx.amount}</td>
              <td>{tx.fee}</td>
              <td>{tx.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionFeed;