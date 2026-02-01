import React, { useState, useEffect } from 'react';
import { getBlock } from './get_block';
import { Block } from './block';

interface BlockExplorerProps {
  // Add any props the block explorer component needs
}

const BlockExplorer: React.FC<BlockExplorerProps> = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchBlocks = async () => {
      const { blocks, totalPages } = await getBlocksForPage(currentPage);
      setBlocks(blocks);
      setTotalPages(totalPages);
    };
    fetchBlocks();
  }, [currentPage]);

  const getBlocksForPage = async (page: number) => {
    const { blocks, totalPages } = await getBlock(page);
    return { blocks, totalPages };
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <h1>ClawChain Block Explorer</h1>
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
      <div>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            disabled={page === currentPage}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BlockExplorer;