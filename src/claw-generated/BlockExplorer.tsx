import React, { useState, useEffect } from 'react';
import { Block } from '../models/Block';
import { getBlocks } from '../services/BlockService';

const BlockExplorer: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    const blocks = await getBlocks();
    setBlocks(blocks);
  };

  return (
    <div>
      <h1>Block Explorer</h1>
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
    </div>
  );
};

export default BlockExplorer;