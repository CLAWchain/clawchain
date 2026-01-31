import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Transaction } from './transactions/transaction';

interface TransactionExplorerProps {
  blockHeight: number;
}

const TransactionExplorer: React.FC<TransactionExplorerProps> = ({ blockHeight }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`/api/blocks/${blockHeight}/transactions`);
        setTransactions(response.data);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch transaction data');
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, [blockHeight]);

  return (
    <div>
      <h1>Transaction Explorer</h1>
      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Sender</th>
              <th>Receiver</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <tr key={index}>
                <td>{tx.from.toString()}</td>
                <td>{tx.to.toString()}</td>
                <td>{tx.amount}</td>
                <td>{tx.verifySignature() ? 'Confirmed' : 'Pending'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TransactionExplorer;