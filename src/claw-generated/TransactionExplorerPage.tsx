import React, { useState, useEffect } from 'react';
import { TransactionService, Transaction } from './TransactionService';
import TransactionDetailsModal from './TransactionDetailsModal';

const TransactionExplorerPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    // Fetch recent transactions
    const fetchTransactions = async () => {
      const txs = await TransactionService.getTransactions();
      setTransactions(txs);
    };
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(tx =>
    tx.from.includes(searchQuery) || tx.to.includes(searchQuery) || tx.hash.includes(searchQuery)
  );

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleModalClose = () => {
    setSelectedTransaction(null);
  };

  return (
    <div>
      <h1>Transaction Explorer</h1>
      <input
        type="text"
        placeholder="Search by sender, receiver, or transaction hash"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />
      <table>
        <thead>
          <tr>
            <th>Sender</th>
            <th>Receiver</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Hash</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map(tx => (
            <tr key={tx.hash} onClick={() => handleTransactionClick(tx)}>
              <td>{tx.from}</td>
              <td>{tx.to}</td>
              <td>{tx.amount}</td>
              <td>{tx.status}</td>
              <td>{tx.hash}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedTransaction && (
        <TransactionDetailsModal transaction={selectedTransaction} onClose={handleModalClose} />
      )}
    </div>
  );
};

export default TransactionExplorerPage;