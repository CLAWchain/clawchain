import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { getTransaction } from '../rpc/getTransaction';

const TransactionExplorer: React.FC = () => {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactionSignature, setTransactionSignature] = useState('');

  useEffect(() => {
    async function fetchTransaction() {
      if (transactionSignature) {
        const tx = await getTransaction(transactionSignature);
        setTransaction(tx);
        setLoading(false);
      }
    }
    fetchTransaction();
  }, [transactionSignature]);

  const handleTransactionSignatureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTransactionSignature(event.target.value);
  };

  const handleTransactionExplore = () => {
    setLoading(true);
  };

  return (
    <div>
      <h1>Transaction Explorer</h1>
      <div>
        <label htmlFor="transactionSignature">Transaction Signature:</label>
        <input
          id="transactionSignature"
          type="text"
          value={transactionSignature}
          onChange={handleTransactionSignatureChange}
        />
        <button onClick={handleTransactionExplore}>Explore</button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : transaction ? (
        <div>
          <h2>Transaction Details</h2>
          <p>Sender: {transaction.from}</p>
          <p>Receiver: {transaction.to}</p>
          <p>Amount: {transaction.value}</p>
          <p>Status: {transaction.status ? 'Successful' : 'Failed'}</p>
          <p>Timestamp: {new Date(transaction.timestamp * 1000).toLocaleString()}</p>
        </div>
      ) : (
        <div>No transaction found</div>
      )}
    </div>
  );
};

export default TransactionExplorer;