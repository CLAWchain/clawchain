import React, { useState, useEffect } from 'react';
import { TransactionPool } from './TransactionPool';
import { Transaction } from './transaction';

interface TransactionFeedProps {
  transactionPool: TransactionPool;
}

export const TransactionFeed: React.FC&lt;TransactionFeedProps&gt; = ({ transactionPool }) =&gt; {
  const [pendingTransactions, setPendingTransactions] = useState&lt;Transaction[]&gt;([]);
  const [confirmedTransactions, setConfirmedTransactions] = useState&lt;Transaction[]&gt;([]);

  useEffect(() =&gt; {
    const onTransactionAdded = (transaction: Transaction) =&gt; {
      setPendingTransactions((prev) =&gt; [...prev, transaction]);
    };

    const onTransactionConfirmed = (transaction: Transaction) =&gt; {
      setPendingTransactions((prev) =&gt; prev.filter((tx) =&gt; tx.signature !== transaction.signature));
      setConfirmedTransactions((prev) =&gt; [...prev, transaction]);
    };

    transactionPool.on('transactionAdded', onTransactionAdded);
    transactionPool.on('transactionConfirmed', onTransactionConfirmed);

    return () =&gt; {
      transactionPool.off('transactionAdded', onTransactionAdded);
      transactionPool.off('transactionConfirmed', onTransactionConfirmed);
    };
  }, [transactionPool]);

  return (
    &lt;div&gt;
      &lt;h2&gt;Pending Transactions&lt;/h2&gt;
      &lt;ul&gt;
        {pendingTransactions.map((tx) =&gt; (
          &lt;li key={tx.signature}&gt;{tx.signature}&lt;/li&gt;
        ))}
      &lt;/ul&gt;
      &lt;h2&gt;Confirmed Transactions&lt;/h2&gt;
      &lt;ul&gt;
        {confirmedTransactions.map((tx) =&gt; (
          &lt;li key={tx.signature}&gt;{tx.signature}&lt;/li&gt;
        ))}
      &lt;/ul&gt;
    &lt;/div&gt;
  );
};