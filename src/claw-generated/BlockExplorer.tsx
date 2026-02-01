import React, { useState, useEffect } from 'react';
import { Block } from '../types';
import TransactionExplorer from './TransactionExplorer';

const BlockExplorer: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    // Fetch block data from the backend
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    try {
      const response = await fetch('/api/blocks');
      const data = await response.json();
      setBlocks(data);
    } catch (error) {
      console.error('Error fetching blocks:', error);
    }
  };

  return (
    <div>
      <h1>Block Explorer</h1>
      <table>
        <thead>
          <tr>
            <th>Height</th>
            <th>Hash</th>
            <th>Transactions</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((block) => (
            <tr key={block.hash}>
              <td>{block.height}</td>
              <td>{block.hash}</td>
              <td>{block.transactions.length}</td>
              <td>{new Date(block.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <TransactionExplorer />
    </div>
  );
};

export default BlockExplorer;