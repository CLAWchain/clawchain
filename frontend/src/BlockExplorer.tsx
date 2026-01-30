import React, { useState, useEffect } from 'react';

interface Block {
  height: number;
  hash: string;
  parentHash: string;
  producer: string;
  timestamp: number;
  transactionCount: number;
  gasUsed: string;
  gasLimit: string;
  stateRoot: string;
}

interface Transaction {
  hash: string;
  blockHeight: number;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  status: string;
  timestamp: number;
}

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function BlockExplorer() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'blocks' | 'transactions'>('blocks');
  const [stats, setStats] = useState({
    blockHeight: 0,
    totalTransactions: 0,
    avgBlockTime: 0,
    tps: 0
  });

  useEffect(() => {
    fetchBlocks();
    fetchStats();
    const interval = setInterval(() => {
      fetchBlocks();
      fetchStats();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchBlocks = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/chain/blocks?limit=20`);
      if (response.ok) {
        const data = await response.json();
        setBlocks(data.blocks || []);
      }
    } catch (e) {
      console.error('Failed to fetch blocks:', e);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/agent/status`);
      if (response.ok) {
        const data = await response.json();
        setStats({
          blockHeight: data.blockHeight || 0,
          totalTransactions: data.transactionCount || 0,
          avgBlockTime: 10,
          tps: 0
        });
      }
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      // Try to find by block height
      if (/^\d+$/.test(searchQuery)) {
        const response = await fetch(`${API_BASE}/api/chain/block/${searchQuery}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResult({ type: 'block', data });
          return;
        }
      }
      
      // Try to find by hash (block or transaction)
      const blockResponse = await fetch(`${API_BASE}/api/chain/block/hash/${searchQuery}`);
      if (blockResponse.ok) {
        const data = await blockResponse.json();
        setSearchResult({ type: 'block', data });
        return;
      }
      
      const txResponse = await fetch(`${API_BASE}/api/chain/tx/${searchQuery}`);
      if (txResponse.ok) {
        const data = await txResponse.json();
        setSearchResult({ type: 'transaction', data });
        return;
      }
      
      setSearchResult({ type: 'error', message: 'Not found' });
    } catch (e) {
      setSearchResult({ type: 'error', message: 'Search failed' });
    }
  };

  const formatHash = (hash: string) => {
    if (!hash) return '-';
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ 
          fontSize: 28, 
          fontWeight: 700, 
          color: 'var(--coral)',
          marginBottom: 8,
          fontFamily: 'var(--font-mono)'
        }}>
          Block Explorer
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Explore the ClawChain blockchain
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 32
      }}>
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 12,
          padding: 20,
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 4 }}>BLOCK HEIGHT</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--coral)', fontFamily: 'var(--font-mono)' }}>
            {stats.blockHeight.toLocaleString()}
          </div>
        </div>
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 12,
          padding: 20,
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 4 }}>TOTAL TRANSACTIONS</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--teal)', fontFamily: 'var(--font-mono)' }}>
            {stats.totalTransactions.toLocaleString()}
          </div>
        </div>
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 12,
          padding: 20,
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 4 }}>AVG BLOCK TIME</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            ~10s
          </div>
        </div>
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 12,
          padding: 20,
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 4 }}>NETWORK</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>
            Mainnet
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ 
        display: 'flex', 
        gap: 12, 
        marginBottom: 24,
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="Search by block height, block hash, or transaction hash..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{
            flex: 1,
            minWidth: 300,
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: 14,
            fontFamily: 'var(--font-mono)'
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: '12px 24px',
            borderRadius: 8,
            border: 'none',
            background: 'var(--coral)',
            color: 'white',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Search
        </button>
      </div>

      {/* Search Result */}
      {searchResult && (
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          border: '1px solid var(--border-color)'
        }}>
          {searchResult.type === 'error' ? (
            <div style={{ color: 'var(--coral)' }}>{searchResult.message}</div>
          ) : searchResult.type === 'block' ? (
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--coral)' }}>
                Block #{searchResult.data.height}
              </div>
              <div style={{ display: 'grid', gap: 8, fontSize: 13 }}>
                <div><span style={{ color: 'var(--text-secondary)' }}>Hash:</span> <span style={{ fontFamily: 'var(--font-mono)' }}>{searchResult.data.hash}</span></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Producer:</span> {searchResult.data.producer}</div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Timestamp:</span> {new Date(searchResult.data.timestamp).toLocaleString()}</div>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--teal)' }}>
                Transaction
              </div>
              <div style={{ display: 'grid', gap: 8, fontSize: 13 }}>
                <div><span style={{ color: 'var(--text-secondary)' }}>Hash:</span> <span style={{ fontFamily: 'var(--font-mono)' }}>{searchResult.data.hash}</span></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>From:</span> {searchResult.data.from}</div>
                <div><span style={{ color: 'var(--text-secondary)' }}>To:</span> {searchResult.data.to}</div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Value:</span> {searchResult.data.value} CLAW</div>
              </div>
            </div>
          )}
          <button
            onClick={() => setSearchResult(null)}
            style={{
              marginTop: 12,
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid var(--border-color)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: 12,
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        </div>
      )}

      {/* View Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setView('blocks')}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: 'none',
            background: view === 'blocks' ? 'var(--coral)' : 'var(--bg-secondary)',
            color: view === 'blocks' ? 'white' : 'var(--text-secondary)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          Recent Blocks
        </button>
        <button
          onClick={() => setView('transactions')}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: 'none',
            background: view === 'transactions' ? 'var(--teal)' : 'var(--bg-secondary)',
            color: view === 'transactions' ? 'white' : 'var(--text-secondary)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          Recent Transactions
        </button>
      </div>

      {/* Blocks Table */}
      {view === 'blocks' && (
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 12,
          border: '1px solid var(--border-color)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>HEIGHT</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>HASH</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>PRODUCER</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>TXS</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>TIME</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Loading blocks...
                  </td>
                </tr>
              ) : blocks.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No blocks found
                  </td>
                </tr>
              ) : (
                blocks.map((block, i) => (
                  <tr 
                    key={block.height}
                    style={{ 
                      borderBottom: i < blocks.length - 1 ? '1px solid var(--border-color)' : 'none',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(232, 90, 79, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onClick={() => setSelectedBlock(block)}
                  >
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--coral)', fontWeight: 600 }}>
                      #{block.height}
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                      {formatHash(block.hash)}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>
                      {block.producer}
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                      {block.transactionCount || 0}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                      {formatTimeAgo(block.timestamp)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Transactions Table */}
      {view === 'transactions' && (
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 12,
          border: '1px solid var(--border-color)',
          padding: 24,
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          No transactions yet. The chain is producing blocks but no user transactions have been submitted.
        </div>
      )}

      {/* Block Detail Modal */}
      {selectedBlock && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 24
          }}
          onClick={() => setSelectedBlock(null)}
        >
          <div 
            style={{
              background: 'var(--bg-primary)',
              borderRadius: 16,
              padding: 24,
              maxWidth: 600,
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              border: '1px solid var(--border-color)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--coral)' }}>
                Block #{selectedBlock.height}
              </h2>
              <button
                onClick={() => setSelectedBlock(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: 24,
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>HASH</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, wordBreak: 'break-all' }}>
                  {selectedBlock.hash}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>PARENT HASH</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, wordBreak: 'break-all' }}>
                  {selectedBlock.parentHash}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>PRODUCER</div>
                  <div style={{ fontSize: 14 }}>{selectedBlock.producer}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>TIMESTAMP</div>
                  <div style={{ fontSize: 14 }}>{new Date(selectedBlock.timestamp).toLocaleString()}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>GAS USED</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}>{selectedBlock.gasUsed || '0'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>GAS LIMIT</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}>{selectedBlock.gasLimit || '8000000'}</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>STATE ROOT</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, wordBreak: 'break-all' }}>
                  {selectedBlock.stateRoot || '-'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>TRANSACTIONS</div>
                <div style={{ fontSize: 14 }}>{selectedBlock.transactionCount || 0} transactions</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
