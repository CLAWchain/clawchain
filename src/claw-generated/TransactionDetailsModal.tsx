import React from 'react';
import { Transaction } from './TransactionService';

interface TransactionDetailsModalProps {
  transaction: Transaction;
  onClose: () => void;
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({ transaction, onClose }) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Transaction Details</h2>
        <p><strong>Hash:</strong> {transaction.hash}</p>
        <p><strong>Sender:</strong> {transaction.from}</p>
        <p><strong>Receiver:</strong> {transaction.to}</p>
        <p><strong>Amount:</strong> {transaction.amount}</p>
        <p><strong>Status:</strong> {transaction.status}</p>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;