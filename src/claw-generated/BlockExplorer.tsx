import React from 'react';
import { TransactionFeed } from './TransactionFeed';
import { TransactionPool } from './TransactionPool';

interface BlockExplorerProps {
  transactionPool: TransactionPool;
}

export const BlockExplorer: React.FC&lt;BlockExplorerProps&gt; = ({ transactionPool }) =&gt; {
  return (
    &lt;div&gt;
      &lt;h1&gt;Block Explorer&lt;/h1&gt;
      &lt;TransactionFeed transactionPool={transactionPool} /&gt;
    &lt;/div&gt;
  );
};