import React from 'react';
import { useParams } from 'react-router-dom';

interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
}

const TransactionPage: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();

  const [transaction, setTransaction] = React.useState<Transaction | null>(null);

  React.useEffect(() => {
    // Fetch transaction details from the backend
    const fetchTransactionDetails = async () => {
      const response = await fetch(`/api/transactions/${transactionId}`);
      const data = await response.json();
      setTransaction(data);
    };
    fetchTransactionDetails();
  }, [transactionId]);

  if (!transaction) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Transaction Details</h2>
      <p>ID: {transaction.id}</p>
      <p>From: {transaction.from}</p>
      <p>To: {transaction.to}</p>
      <p>Amount: {transaction.amount} CLW</p>
      <p>Status: {transaction.status}</p>
    </div>
  );
};

export default TransactionPage;