import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAddressBalance, getAddressTransactions, getAddressTokens } from '@/api/blockchain';

const AddressPage: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const [balance, setBalance] = useState<string>('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [transactionsPerPage, setTransactionsPerPage] = useState<number>(10);
  const [tokensPerPage, setTokensPerPage] = useState<number>(10);

  useEffect(() => {
    const fetchAddressData = async () => {
      const balanceResult = await getAddressBalance(address);
      setBalance(balanceResult.balance);

      const transactionsResult = await getAddressTransactions(address, page, transactionsPerPage);
      setTransactions(transactionsResult.transactions);

      const tokensResult = await getAddressTokens(address, page, tokensPerPage);
      setTokens(tokensResult.tokens);
    };

    fetchAddressData();
  }, [address, page, transactionsPerPage, tokensPerPage]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleTransactionsPerPageChange = (newPerPage: number) => {
    setTransactionsPerPage(newPerPage);
  };

  const handleTokensPerPageChange = (newPerPage: number) => {
    setTokensPerPage(newPerPage);
  };

  return (
    <div>
      <h1>Address: {address}</h1>
      <p>Balance: {balance}</p>
      <h2>Transactions</h2>
      <div>
        <label>
          Transactions per page:
          <select value={transactionsPerPage} onChange={(e) => handleTransactionsPerPageChange(parseInt(e.target.value))}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </label>
        <button onClick={() => handlePageChange(page - 1)}>Prev</button>
        <button onClick={() => handlePageChange(page + 1)}>Next</button>
      </div>
      <ul>
        {transactions.map((tx) => (
          <li key={tx.hash}>{tx.hash}</li>
        ))}
      </ul>
      <h2>Tokens</h2>
      <div>
        <label>
          Tokens per page:
          <select value={tokensPerPage} onChange={(e) => handleTokensPerPageChange(parseInt(e.target.value))}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </label>
        <button onClick={() => handlePageChange(page - 1)}>Prev</button>
        <button onClick={() => handlePageChange(page + 1)}>Next</button>
      </div>
      <ul>
        {tokens.map((token) => (
          <li key={token.contract}>{token.symbol} - {token.balance}</li>
        ))}
      </ul>
    </div>
  );
};

export default AddressPage;