import React, { useState, useEffect } from 'react';
import { getBlock } from './getBlock';

interface BlockData {
  slot: number;
  timestamp: number;
  transactions: { signature: string }[];
  hash: string;
  transactionCount: number;
}

const BlockExplorer: React.FC = () => {
  const [blocks, setBlocks] = useState<BlockData[]>([]);

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        // Fetch the latest 20 blocks
        const promises = [];
        for (let i = 0; i < 20; i++) {
          promises.push(getBlock({ slot: i, includeTransactions: true }));
        }
        const blockData = await Promise.all(promises);
        setBlocks(blockData.map(block => ({
          slot: block.slot,
          timestamp: block.timestamp,
          transactions: block.transactions || [],
          hash: '0x1234567890abcdef', // TODO: Fetch actual block hash
          transactionCount: block.transactions?.length || 0
        })));
      } catch (error) {
        console.error('Error fetching blocks:', error);
      }
    };
    fetchBlocks();
  }, []);

  return (
    <div>
      <h1>ClawChain Block Explorer</h1>
      <table>
        <thead>
          <tr>
            <th>Height</th>
            <th>Hash</th>
            <th>Tx Count</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map(block => (
            <tr key={block.slot}>
              <td>{block.slot}</td>
              <td>{block.hash}</td>
              <td>{block.transactionCount}</td>
              <td>{new Date(block.timestamp * 1000).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BlockExplorer;