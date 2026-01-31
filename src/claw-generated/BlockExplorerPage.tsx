import React, { useState, useEffect } from 'react';
import { BlockExplorer } from './BlockExplorer';

interface Block {
  height: number;
  hash: string;
  timestamp: number;
  transactions: number;
}

const BlockExplorerPage: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const blockExplorer = new BlockExplorer();

  useEffect(() => {
    const fetchBlocks = async () => {
      const fetchedBlocks = await blockExplorer.getBlocks();
      setBlocks(fetchedBlocks);
    };
    fetchBlocks();
  }, [blockExplorer]);

  return (
    <div>
      <h1>ClawChain Block Explorer</h1>
      <table>
        <thead>
          <tr>
            <th>Height</th>
            <th>Hash</th>
            <th>Timestamp</th>
            <th>Transactions</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((block, index) => (
            <tr key={index}>
              <td>{block.height}</td>
              <td>{block.hash}</td>
              <td>{new Date(block.timestamp * 1000).toLocaleString()}</td>
              <td>{block.transactions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BlockExplorerPage;