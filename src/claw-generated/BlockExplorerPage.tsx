import React, { useState, useEffect } from 'react';
import { Block } from './Block';
import { BlockExplorer } from './BlockExplorer';

interface BlockExplorerPageProps {
  // Add any props needed for this page
}

const BlockExplorerPage: React.FC<BlockExplorerPageProps> = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    // Fetch block data and update state
    const fetchBlocks = async () => {
      const blockData = await BlockExplorer.getBlocks();
      setBlocks(blockData);
    };
    fetchBlocks();
  }, []);

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
          {blocks.map((block, index) => (
            <tr key={index}>
              <td>{block.height}</td>
              <td>{block.hash}</td>
              <td>{block.transactionCount}</td>
              <td>{new Date(block.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BlockExplorerPage;