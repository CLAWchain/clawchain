import React, { useState, useEffect } from 'react';
import { useClawChain } from '../useClawChain';
import { Transaction } from '../transaction/transaction';

const TransactionExplorer: React.FC = () => {
  const { getTransactions } = useClawChain();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const txs = await getTransactions();
      setTransactions(txs);
    };
    fetchTransactions();
  }, [getTransactions]);

  return (
    <div>
      <h1>Transaction Explorer</h1>
      <table>
        <thead>
          <tr>
            <th>Tx Hash</th>
            <th>From</th>
            <th>To</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.hash}>
              <td>{tx.hash}</td>
              <td>{tx.from}</td>
              <td>{tx.to}</td>
              <td>{tx.amount}</td>
              <td>{tx.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionExplorer;