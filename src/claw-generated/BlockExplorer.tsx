import React, { useState, useEffect } from 'react';
import { Block } from '../types';
import TransactionExplorer from './TransactionExplorer';
import styled from 'styled-components';

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th, td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  th {
    background-color: #f5f5f5;
  }

  tr:hover {
    background-color: #f5f5f5;
  }
`;

const StyledPagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;

  button {
    margin: 0 5px;
    padding: 8px 12px;
    background-color: #f5f5f5;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background-color: #e0e0e0;
    }

    &.active {
      background-color: #007bff;
      color: #fff;
    }
  }
`;

const StyledSearch = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;

  input {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    margin-right: 10px;
  }

  button {
    padding: 8px 12px;
    background-color: #007bff;
    border: none;
    border-radius: 4px;
    color: #fff;
    cursor: pointer;

    &:hover {
      background-color: #0056b3;
    }
  }
`;

const BlockExplorer: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [blocksPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch block data from the backend
    fetchBlocks();
  }, [currentPage, searchQuery]);

  const fetchBlocks = async () => {
    try {
      const response = await fetch(`/api/blocks?page=${currentPage}&limit=${blocksPerPage}&query=${searchQuery}`);
      const data = await response.json();
      setBlocks(data);
    } catch (error) {
      console.error('Error fetching blocks:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const indexOfLastBlock = currentPage * blocksPerPage;
  const indexOfFirstBlock = indexOfLastBlock - blocksPerPage;
  const currentBlocks = blocks.slice(indexOfFirstBlock, indexOfLastBlock);

  return (
    <div>
      <h1>Block Explorer</h1>
      <StyledSearch>
        <input
          type="text"
          placeholder="Search by height, hash, or timestamp"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </StyledSearch>
      <StyledTable>
        <thead>
          <tr>
            <th>Height</th>
            <th>Hash</th>
            <th>Transactions</th>
            <th>Timestamp</th>
            <th>Gas Used</th>
            <th>Gas Limit</th>
          </tr>
        </thead>
        <tbody>
          {currentBlocks.map((block) => (
            <tr key={block.hash}>
              <td>{block.height}</td>
              <td>{block.hash}</td>
              <td>{block.transactions.length}</td>
              <td>{new Date(block.timestamp).toLocaleString()}</td>
              <td>{block.gasUsed}</td>
              <td>{block.gasLimit}</td>
            </tr>
          ))}
        </tbody>
      </StyledTable>
      <StyledPagination>
        {Array.from({ length: Math.ceil(blocks.length / blocksPerPage) }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={currentPage === page ? 'active' : ''}
          >
            {page}
          </button>
        ))}
      </StyledPagination>
      <TransactionExplorer />
    </div>
  );
};

export default BlockExplorer;