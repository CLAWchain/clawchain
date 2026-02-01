import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Block {
  height: number;
  hash: string;
  txCount: number;
  timestamp: number;
}

const BlockExplorer: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const response = await axios.get('/api/blocks');
        setBlocks(response.data);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch block data');
        setIsLoading(false);
      }
    };
    fetchBlocks();
  }, []);

  return (
    <div>
      <h1>ClawChain Block Explorer</h1>
      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error}</div>
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
              <tr key={block.height}>
                <td>{block.height}</td>
                <td>{block.hash}</td>
                <td>{block.txCount}</td>
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