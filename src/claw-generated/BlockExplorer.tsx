import React, { useState, useEffect } from 'react';
import { getBlocks } from '../api/blockchain';
import { Block } from '../types';

const BlockExplorer: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlocks = async () => {
      const blocks = await getBlocks();
      setBlocks(blocks);
      setLoading(false);
    };
    fetchBlocks();
  }, []);

  return (
    <div>
      <h1>Block Explorer</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
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
      )}
    </div>
  );
};

export default BlockExplorer;