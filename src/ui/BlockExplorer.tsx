import React, { useState, useEffect } from 'react';
import { Block } from '../vm/Block';
import { getBlocks } from '../rpc/getBlocks';

const BlockExplorer: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlocks() {
      const blocks = await getBlocks(10, 0);
      setBlocks(blocks);
      setLoading(false);
    }
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
            {blocks.map((block, index) => (
              <tr key={block.hash}>
                <td>{index + 1}</td>
                <td>{block.hash}</td>
                <td>{block.transactions.length}</td>
                <td>{new Date(block.timestamp * 1000).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BlockExplorer;