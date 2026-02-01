import React, { useState, useEffect } from 'react';
import { Transaction } from './types/Transaction';
import TransactionExplorer from './TransactionExplorer';
import transactionRouter from './transaction';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Fetch transactions from the backend
    const fetchTransactions = async () => {
      const response = await fetch('/api/transactions');
      const data = await response.json();
      setTransactions(data);
    };
    fetchTransactions();
  }, []);

  return (
    <div>
      <TransactionExplorer transactions={transactions} />
    </div>
  );
};

export default App;