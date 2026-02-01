import React, { useState, useEffect } from 'react';
import { Transaction } from '../types/Transaction';

interface TransactionExplorerProps {
  transactions: Transaction[];
}

const TransactionExplorer: React.FC<TransactionExplorerProps> = ({ transactions }) => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    // Load initial transactions
  }, []);

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  return (
    <div className="transaction-explorer">
      <h2>Transaction Explorer</h2>
      <div className="transaction-list">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className={`transaction-item ${selectedTransaction?.id === tx.id ? 'selected' : ''}`}
            onClick={() => handleTransactionClick(tx)}
          >
            <div className="sender">{tx.sender}</div>
            <div className="receiver">{tx.receiver}</div>
            <div className="amount">{tx.amount}</div>
            <div className="status">{tx.status}</div>
          </div>
        ))}
      </div>
      {selectedTransaction && (
        <div className="transaction-details">
          <h3>Transaction Details</h3>
          <div className="detail">
            <span className="label">Sender:</span> {selectedTransaction.sender}
          </div>
          <div className="detail">
            <span className="label">Receiver:</span> {selectedTransaction.receiver}
          </div>
          <div className="detail">
            <span className="label">Amount:</span> {selectedTransaction.amount}
          </div>
          <div className="detail">
            <span className="label">Status:</span> {selectedTransaction.status}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionExplorer;