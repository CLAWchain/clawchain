import React, { useState, useEffect } from 'react';
import { BlockExplorer } from './BlockExplorer';
import { Block } from './Block';
import { Link } from 'react-router-dom';

const BlockExplorerPage: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const { data, totalPages } = await BlockExplorer.getBlocks(10, (page - 1) * 10);
        setBlocks(data);
        setTotalPages(totalPages);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching blocks:', error);
        setLoading(false);
      }
    };
    fetchBlocks();
  }, [page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div>
      <h1>Block Explorer</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
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
                  <td>
                    <Link to={`/blocks/${block.height}`}>{block.height}</Link>
                  </td>
                  <td>{block.hash}</td>
                  <td>{block.transactions.length}</td>
                  <td>{new Date(block.timestamp * 1000).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                disabled={pageNumber === page}
              >
                {pageNumber}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BlockExplorerPage;