import React, { useState, useEffect } from 'react';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

interface WalletData {
  id: string;
  address: string;
  privateKey?: string;
  balance: number;
  created_at: number;
  last_faucet_claim: number;
  total_received: number;
  total_sent: number;
  tx_count: number;
  transactions?: Transaction[];
}

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'faucet';
  amount: number;
  from_address: string;
  to_address: string;
  hash: string;
  timestamp: number;
  status: string;
}

interface FaucetStatus {
  canClaim: boolean;
  nextClaimAt: number;
  faucetAmount: number;
}

interface LeaderboardEntry {
  address: string;
  balance: number;
  tx_count: number;
}

export const Wallet: React.FC = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [view, setView] = useState<'connect' | 'wallet' | 'send' | 'leaderboard'>('connect');
  const [isLoading, setIsLoading] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [faucetStatus, setFaucetStatus] = useState<FaucetStatus | null>(null);
  const [claimingFaucet, setClaimingFaucet] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Send form
  const [sendForm, setSendForm] = useState({ toAddress: '', amount: '' });
  const [sendLoading, setSendLoading] = useState(false);

  // Import form
  const [importAddress, setImportAddress] = useState('');

  // Load wallet from localStorage
  useEffect(() => {
    const savedWallet = localStorage.getItem('clawchain_wallet');
    if (savedWallet) {
      try {
        const parsed = JSON.parse(savedWallet);
        if (parsed.address) {
          fetchWallet(parsed.address);
        }
      } catch (e) {
        console.error('Failed to parse saved wallet:', e);
        localStorage.removeItem('clawchain_wallet');
      }
    }
  }, []);

  // Fetch faucet status when wallet loads
  useEffect(() => {
    if (wallet) {
      fetchFaucetStatus();
      const interval = setInterval(fetchFaucetStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [wallet?.address]);

  const fetchWallet = async (address: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/wallet/address/${address}`);
      const data = await res.json();
      if (data.success && data.wallet) {
        setWallet(data.wallet);
        setView('wallet');
        localStorage.setItem('clawchain_wallet', JSON.stringify({ 
          address: data.wallet.address,
          id: data.wallet.id 
        }));
      } else if (res.status === 404) {
        localStorage.removeItem('clawchain_wallet');
        setWallet(null);
        setView('connect');
      }
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
      const saved = localStorage.getItem('clawchain_wallet');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setWallet({
            id: parsed.id || '',
            address: parsed.address,
            balance: 0,
            created_at: Date.now(),
            last_faucet_claim: 0,
            total_received: 0,
            total_sent: 0,
            tx_count: 0,
            transactions: []
          });
          setView('wallet');
          setMessage({ type: 'error', text: 'Unable to sync with server' });
        } catch (e) {
          // ignore
        }
      }
    }
  };

  const fetchFaucetStatus = async () => {
    if (!wallet) return;
    try {
      const res = await fetch(`${API_BASE}/api/wallet/faucet/status/${wallet.address}`);
      const data = await res.json();
      setFaucetStatus(data);
    } catch (error) {
      console.error('Failed to fetch faucet status:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/wallet/leaderboard`);
      const data = await res.json();
      setLeaderboard(data.wallets || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const createWallet = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/wallet/create`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setWallet({ ...data.wallet, transactions: [] });
        localStorage.setItem('clawchain_wallet', JSON.stringify(data.wallet));
        setView('wallet');
        setMessage({ type: 'success', text: '[+] Wallet created. Save your private key.' });
        setShowPrivateKey(true);
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create wallet' });
    }
    setIsLoading(false);
  };

  const importWallet = async () => {
    if (!importAddress.startsWith('claude_')) {
      setMessage({ type: 'error', text: 'Invalid address format' });
      return;
    }
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/wallet/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: importAddress })
      });
      const data = await res.json();
      if (data.success) {
        setWallet(data.wallet);
        localStorage.setItem('clawchain_wallet', JSON.stringify({ address: importAddress }));
        setView('wallet');
        setMessage({ type: 'success', text: '[+] Wallet imported' });
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to import wallet' });
    }
    setIsLoading(false);
  };

  const claimFaucet = async () => {
    if (!wallet) return;
    setClaimingFaucet(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/wallet/faucet/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: wallet.address })
      });
      const data = await res.json();
      if (data.success) {
        setWallet(prev => prev ? { ...prev, balance: data.newBalance } : null);
        setMessage({ type: 'success', text: `[+] Claimed ${data.amount} CLAW` });
        fetchFaucetStatus();
        fetchWallet(wallet.address);
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to claim' });
    }
    setClaimingFaucet(false);
  };

  const sendTokens = async () => {
    if (!wallet || !sendForm.toAddress || !sendForm.amount) return;
    setSendLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/wallet/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAddress: wallet.address,
          toAddress: sendForm.toAddress,
          amount: parseFloat(sendForm.amount)
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `[+] Sent ${data.amount} CLAW` });
        setSendForm({ toAddress: '', amount: '' });
        fetchWallet(wallet.address);
        setView('wallet');
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send' });
    }
    setSendLoading(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const disconnectWallet = () => {
    localStorage.removeItem('clawchain_wallet');
    setWallet(null);
    setView('connect');
    setShowPrivateKey(false);
    setMessage(null);
  };

  const formatTimeUntil = (timestamp: number) => {
    const now = Date.now();
    const diff = timestamp - now;
    if (diff <= 0) return 'Now';
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${mins}m`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Connect View
  const renderConnect = () => (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      {/* Hero */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px',
        padding: '40px 20px',
        background: 'var(--cc-bg-secondary)',
        border: '1px solid var(--cc-coral)'
      }}>
        <div style={{
          fontSize: '40px',
          color: 'var(--cc-coral)',
          marginBottom: '20px'
        }}>
          {'<>'}
        </div>
        <h1 style={{ color: 'var(--cc-text-primary)', margin: '0 0 10px', fontSize: '20px' }}>
          CLAWCHAIN WALLET
        </h1>
        <p style={{ color: 'var(--cc-text-muted)', margin: 0, fontSize: '12px' }}>
          Create or import your wallet
        </p>
      </div>

      {message && (
        <div style={{
          padding: '14px',
          marginBottom: '20px',
          background: 'var(--cc-bg-secondary)',
          border: `1px solid ${message.type === 'success' ? 'var(--cc-coral)' : '#ff6464'}`,
          color: message.type === 'success' ? 'var(--cc-coral)' : '#ff6464',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          {message.text}
        </div>
      )}

      {/* Create New Wallet */}
      <div style={{
        background: 'var(--cc-bg-secondary)',
        border: '1px solid var(--cc-border)',
        padding: '24px',
        marginBottom: '16px'
      }}>
        <h3 style={{ color: 'var(--cc-text-primary)', margin: '0 0 12px', fontSize: '13px' }}>
          CREATE NEW WALLET
        </h3>
        <p style={{ color: 'var(--cc-text-muted)', margin: '0 0 16px', fontSize: '11px' }}>
          Generate a new wallet with a unique address
        </p>
        <button
          onClick={createWallet}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '14px',
            background: isLoading ? 'var(--cc-bg-tertiary)' : 'var(--cc-coral)',
            border: 'none',
            color: isLoading ? 'var(--cc-text-muted)' : 'var(--cc-bg-primary)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontFamily: 'JetBrains Mono, monospace'
          }}
        >
          {isLoading ? 'CREATING...' : 'CREATE WALLET'}
        </button>
      </div>

      {/* Import Existing */}
      <div style={{
        background: 'var(--cc-bg-secondary)',
        border: '1px solid var(--cc-border)',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h3 style={{ color: 'var(--cc-text-primary)', margin: '0 0 12px', fontSize: '13px' }}>
          IMPORT WALLET
        </h3>
        <input
          type="text"
          value={importAddress}
          onChange={e => setImportAddress(e.target.value)}
          placeholder="claude_..."
          style={{
            width: '100%',
            padding: '12px',
            background: 'var(--cc-bg-tertiary)',
            border: '1px solid var(--cc-border)',
            color: 'var(--cc-text-primary)',
            fontSize: '12px',
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: '12px',
            boxSizing: 'border-box'
          }}
        />
        <button
          onClick={importWallet}
          disabled={isLoading || !importAddress}
          style={{
            width: '100%',
            padding: '14px',
            background: 'transparent',
            border: '1px solid var(--cc-coral)',
            color: 'var(--cc-coral)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: (isLoading || !importAddress) ? 'not-allowed' : 'pointer',
            fontFamily: 'JetBrains Mono, monospace',
            opacity: (isLoading || !importAddress) ? 0.5 : 1
          }}
        >
          IMPORT
        </button>
      </div>

      {/* View Leaderboard */}
      <button
        onClick={() => { fetchLeaderboard(); setView('leaderboard'); }}
        style={{
          width: '100%',
          padding: '12px',
          background: 'transparent',
          border: '1px dashed var(--cc-border)',
          color: 'var(--cc-text-muted)',
          fontSize: '11px',
          cursor: 'pointer',
          fontFamily: 'JetBrains Mono, monospace'
        }}
      >
        VIEW LEADERBOARD
      </button>
    </div>
  );

  // Wallet View
  const renderWallet = () => (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {message && (
        <div style={{
          padding: '14px',
          marginBottom: '20px',
          background: 'var(--cc-bg-secondary)',
          border: `1px solid ${message.type === 'success' ? 'var(--cc-coral)' : '#ff6464'}`,
          color: message.type === 'success' ? 'var(--cc-coral)' : '#ff6464',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          {message.text}
        </div>
      )}

      {/* Balance Card */}
      <div style={{
        background: 'var(--cc-bg-secondary)',
        border: '1px solid var(--cc-coral)',
        padding: '30px',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <div style={{ color: 'var(--cc-text-muted)', fontSize: '10px', marginBottom: '8px', letterSpacing: '1px' }}>
          TOTAL BALANCE
        </div>
        <div style={{ color: 'var(--cc-text-primary)', fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>
          {wallet?.balance.toLocaleString()} <span style={{ color: 'var(--cc-coral)', fontSize: '18px' }}>CLAW</span>
        </div>
        <div style={{ 
          color: 'var(--cc-text-muted)', 
          fontSize: '11px', 
          fontFamily: 'monospace',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <span>{wallet?.address.slice(0, 20)}...{wallet?.address.slice(-8)}</span>
          <button
            onClick={() => copyToClipboard(wallet?.address || '', 'address')}
            style={{
              background: 'none',
              border: 'none',
              color: copied === 'address' ? 'var(--cc-text-primary)' : 'var(--cc-coral)',
              cursor: 'pointer',
              fontSize: '10px',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            {copied === 'address' ? 'COPIED' : 'COPY'}
          </button>
        </div>
      </div>

      {/* Private Key Warning */}
      {wallet?.privateKey && showPrivateKey && (
        <div style={{
          background: 'var(--cc-bg-secondary)',
          border: '1px solid #ff6464',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ color: '#ff6464', fontSize: '11px', fontWeight: 600, marginBottom: '12px' }}>
            [!] SAVE YOUR PRIVATE KEY
          </div>
          <div style={{ color: 'var(--cc-text-muted)', fontSize: '10px', marginBottom: '12px' }}>
            This key will not be shown again. Store it securely.
          </div>
          <div style={{
            background: 'var(--cc-bg-tertiary)',
            padding: '12px',
            fontFamily: 'monospace',
            fontSize: '10px',
            color: 'var(--cc-text-primary)',
            wordBreak: 'break-all',
            marginBottom: '12px'
          }}>
            {wallet.privateKey}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => copyToClipboard(wallet.privateKey || '', 'privateKey')}
              style={{
                flex: 1,
                padding: '10px',
                background: 'var(--cc-bg-tertiary)',
                border: '1px solid var(--cc-border)',
                color: copied === 'privateKey' ? 'var(--cc-coral)' : 'var(--cc-text-primary)',
                fontSize: '10px',
                cursor: 'pointer',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            >
              {copied === 'privateKey' ? 'COPIED' : 'COPY KEY'}
            </button>
            <button
              onClick={() => setShowPrivateKey(false)}
              style={{
                flex: 1,
                padding: '10px',
                background: 'var(--cc-coral)',
                border: 'none',
                color: 'var(--cc-bg-primary)',
                fontSize: '10px',
                cursor: 'pointer',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            >
              I SAVED IT
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setView('send')}
          style={{
            padding: '16px',
            background: 'var(--cc-coral)',
            border: 'none',
            color: 'var(--cc-bg-primary)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'JetBrains Mono, monospace'
          }}
        >
          SEND
        </button>
        <button
          onClick={claimFaucet}
          disabled={claimingFaucet || !faucetStatus?.canClaim}
          style={{
            padding: '16px',
            background: (claimingFaucet || !faucetStatus?.canClaim) ? 'var(--cc-bg-tertiary)' : 'var(--cc-coral)',
            border: (claimingFaucet || !faucetStatus?.canClaim) ? '1px solid var(--cc-border)' : 'none',
            color: (claimingFaucet || !faucetStatus?.canClaim) ? 'var(--cc-text-muted)' : 'var(--cc-bg-primary)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: (claimingFaucet || !faucetStatus?.canClaim) ? 'not-allowed' : 'pointer',
            fontFamily: 'JetBrains Mono, monospace'
          }}
        >
          {claimingFaucet ? 'CLAIMING...' : faucetStatus?.canClaim ? 'CLAIM FAUCET' : `WAIT ${formatTimeUntil(faucetStatus?.nextClaimAt || 0)}`}
        </button>
      </div>

      {/* Faucet Info */}
      <div style={{
        background: 'var(--cc-bg-secondary)',
        border: '1px solid var(--cc-border)',
        padding: '16px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ color: 'var(--cc-text-muted)', fontSize: '9px', letterSpacing: '1px' }}>FAUCET</div>
          <div style={{ color: 'var(--cc-text-primary)', fontSize: '12px', fontWeight: 600 }}>
            {faucetStatus?.faucetAmount || 100} CLAW / 24h
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'var(--cc-text-muted)', fontSize: '9px', letterSpacing: '1px' }}>STATUS</div>
          <div style={{ 
            color: faucetStatus?.canClaim ? 'var(--cc-coral)' : 'var(--cc-text-muted)', 
            fontSize: '11px',
            fontWeight: 600
          }}>
            {faucetStatus?.canClaim ? '[READY]' : `[${formatTimeUntil(faucetStatus?.nextClaimAt || 0)}]`}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--cc-border)', marginBottom: '24px' }}>
        {[
          { label: 'TRANSACTIONS', value: wallet?.tx_count || 0 },
          { label: 'RECEIVED', value: wallet?.total_received?.toLocaleString() || 0 },
          { label: 'SENT', value: wallet?.total_sent?.toLocaleString() || 0 }
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'var(--cc-bg-secondary)',
            padding: '14px',
            textAlign: 'center'
          }}>
            <div style={{ color: 'var(--cc-text-muted)', fontSize: '9px', marginBottom: '4px', letterSpacing: '1px' }}>{stat.label}</div>
            <div style={{ color: 'var(--cc-text-primary)', fontSize: '16px', fontWeight: 600 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div style={{
        background: 'var(--cc-bg-secondary)',
        border: '1px solid var(--cc-border)',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <h3 style={{ color: 'var(--cc-text-primary)', margin: '0 0 16px', fontSize: '12px' }}>
          RECENT TRANSACTIONS
        </h3>
        {!wallet?.transactions || wallet.transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--cc-text-muted)' }}>
            <div style={{ fontSize: '20px', marginBottom: '10px', color: 'var(--cc-coral)' }}>{'<>'}</div>
            <p style={{ margin: 0, fontSize: '11px' }}>No transactions yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {wallet.transactions.slice(0, 10).map((tx, i) => (
              <div key={i} style={{
                padding: '12px',
                background: 'var(--cc-bg-tertiary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    background: 'var(--cc-bg-secondary)',
                    border: '1px solid var(--cc-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--cc-coral)',
                    fontSize: '12px'
                  }}>
                    {tx.type === 'receive' || tx.type === 'faucet' ? '+' : '-'}
                  </div>
                  <div>
                    <div style={{ color: 'var(--cc-text-primary)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
                      {tx.type === 'faucet' ? 'Faucet' : tx.type === 'receive' ? 'Received' : 'Sent'}
                    </div>
                    <div style={{ color: 'var(--cc-text-muted)', fontSize: '10px' }}>
                      {formatTimeAgo(tx.timestamp)}
                    </div>
                  </div>
                </div>
                <div style={{
                  color: tx.type === 'receive' || tx.type === 'faucet' ? 'var(--cc-coral)' : 'var(--cc-text-muted)',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  {tx.type === 'receive' || tx.type === 'faucet' ? '+' : '-'}{tx.amount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => { fetchLeaderboard(); setView('leaderboard'); }}
          style={{
            flex: 1,
            padding: '12px',
            background: 'var(--cc-bg-secondary)',
            border: '1px solid var(--cc-border)',
            color: 'var(--cc-text-secondary)',
            fontSize: '10px',
            cursor: 'pointer',
            fontFamily: 'JetBrains Mono, monospace'
          }}
        >
          LEADERBOARD
        </button>
        <button
          onClick={disconnectWallet}
          style={{
            flex: 1,
            padding: '12px',
            background: 'var(--cc-bg-secondary)',
            border: '1px solid var(--cc-border)',
            color: 'var(--cc-text-muted)',
            fontSize: '10px',
            cursor: 'pointer',
            fontFamily: 'JetBrains Mono, monospace'
          }}
        >
          DISCONNECT
        </button>
      </div>
    </div>
  );

  // Send View
  const renderSend = () => (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <button
        onClick={() => setView('wallet')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--cc-text-muted)',
          fontSize: '11px',
          cursor: 'pointer',
          marginBottom: '20px',
          fontFamily: 'JetBrains Mono, monospace'
        }}
      >
        {'<'} Back
      </button>

      <div style={{
        background: 'var(--cc-bg-secondary)',
        border: '1px solid var(--cc-border)',
        padding: '24px'
      }}>
        <h2 style={{ color: 'var(--cc-coral)', margin: '0 0 20px', fontSize: '16px' }}>
          SEND CLAW
        </h2>

        {message && (
          <div style={{
            padding: '14px',
            marginBottom: '16px',
            background: 'var(--cc-bg-tertiary)',
            border: `1px solid ${message.type === 'success' ? 'var(--cc-coral)' : '#ff6464'}`,
            color: message.type === 'success' ? 'var(--cc-coral)' : '#ff6464',
            fontSize: '11px',
            fontFamily: 'monospace'
          }}>
            {message.text}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: 'var(--cc-text-muted)', fontSize: '9px', marginBottom: '6px', letterSpacing: '1px' }}>
            RECIPIENT
          </label>
          <input
            type="text"
            value={sendForm.toAddress}
            onChange={e => setSendForm({ ...sendForm, toAddress: e.target.value })}
            placeholder="claude_..."
            style={{
              width: '100%',
              padding: '14px',
              background: 'var(--cc-bg-tertiary)',
              border: '1px solid var(--cc-border)',
              color: 'var(--cc-text-primary)',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: 'var(--cc-text-muted)', fontSize: '9px', marginBottom: '6px', letterSpacing: '1px' }}>
            AMOUNT
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              value={sendForm.amount}
              onChange={e => setSendForm({ ...sendForm, amount: e.target.value })}
              placeholder="0"
              style={{
                width: '100%',
                padding: '14px',
                paddingRight: '80px',
                background: 'var(--cc-bg-tertiary)',
                border: '1px solid var(--cc-border)',
                color: 'var(--cc-text-primary)',
                fontSize: '16px',
                fontFamily: 'JetBrains Mono, monospace',
                boxSizing: 'border-box'
              }}
            />
            <span style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--cc-coral)',
              fontSize: '12px',
              fontWeight: 600
            }}>
              CLAW
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ color: 'var(--cc-text-muted)', fontSize: '10px' }}>
              Available: {wallet?.balance.toLocaleString()}
            </span>
            <button
              onClick={() => setSendForm({ ...sendForm, amount: wallet?.balance.toString() || '0' })}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--cc-coral)',
                fontSize: '10px',
                cursor: 'pointer',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            >
              MAX
            </button>
          </div>
        </div>

        <button
          onClick={sendTokens}
          disabled={sendLoading || !sendForm.toAddress || !sendForm.amount || parseFloat(sendForm.amount) <= 0}
          style={{
            width: '100%',
            padding: '16px',
            background: (sendLoading || !sendForm.toAddress || !sendForm.amount) ? 'var(--cc-bg-tertiary)' : 'var(--cc-coral)',
            border: 'none',
            color: (sendLoading || !sendForm.toAddress || !sendForm.amount) ? 'var(--cc-text-muted)' : 'var(--cc-bg-primary)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: (sendLoading || !sendForm.toAddress || !sendForm.amount) ? 'not-allowed' : 'pointer',
            fontFamily: 'JetBrains Mono, monospace'
          }}
        >
          {sendLoading ? 'SENDING...' : 'SEND'}
        </button>
      </div>
    </div>
  );

  // Leaderboard View
  const renderLeaderboard = () => (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <button
        onClick={() => setView(wallet ? 'wallet' : 'connect')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--cc-text-muted)',
          fontSize: '11px',
          cursor: 'pointer',
          marginBottom: '20px',
          fontFamily: 'JetBrains Mono, monospace'
        }}
      >
        {'<'} Back
      </button>

      <div style={{
        background: 'var(--cc-bg-secondary)',
        border: '1px solid var(--cc-border)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--cc-border)',
          textAlign: 'center'
        }}>
          <h2 style={{ color: 'var(--cc-coral)', margin: '0 0 8px', fontSize: '16px' }}>
            LEADERBOARD
          </h2>
          <p style={{ color: 'var(--cc-text-muted)', margin: 0, fontSize: '11px' }}>
            Top CLAW holders
          </p>
        </div>

        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '50px 1fr 120px 80px',
          padding: '12px 20px',
          background: 'var(--cc-bg-tertiary)',
          borderBottom: '1px solid var(--cc-border)',
          fontSize: '9px',
          color: 'var(--cc-text-muted)',
          fontWeight: 600,
          letterSpacing: '1px'
        }}>
          <span>RANK</span>
          <span>ADDRESS</span>
          <span>BALANCE</span>
          <span>TXS</span>
        </div>

        {/* Rows */}
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {leaderboard.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--cc-text-muted)' }}>
              <p style={{ fontSize: '11px' }}>No wallets yet</p>
            </div>
          ) : (
            leaderboard.map((entry, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '50px 1fr 120px 80px',
                padding: '14px 20px',
                borderBottom: '1px solid var(--cc-border)',
                fontSize: '11px',
                background: wallet?.address === entry.address ? 'rgba(255,140,66,0.1)' : 'transparent'
              }}>
                <span style={{ 
                  color: i < 3 ? 'var(--cc-coral)' : 'var(--cc-text-muted)',
                  fontWeight: i < 3 ? 600 : 400
                }}>
                  {i + 1}.
                </span>
                <span style={{ 
                  color: wallet?.address === entry.address ? 'var(--cc-coral)' : 'var(--cc-text-secondary)',
                  fontFamily: 'monospace'
                }}>
                  {entry.address.slice(0, 16)}...
                  {wallet?.address === entry.address && <span style={{ color: 'var(--cc-coral)', marginLeft: '8px' }}>(you)</span>}
                </span>
                <span style={{ color: 'var(--cc-text-primary)', fontWeight: 600 }}>
                  {entry.balance.toLocaleString()}
                </span>
                <span style={{ color: 'var(--cc-text-muted)' }}>
                  {entry.tx_count}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      padding: '30px',
      height: '100%',
      overflowY: 'auto',
      fontFamily: 'JetBrains Mono, monospace',
      color: 'var(--cc-text-primary)',
      backgroundColor: 'var(--cc-bg-primary)'
    }}>
      {view === 'connect' && renderConnect()}
      {view === 'wallet' && renderWallet()}
      {view === 'send' && renderSend()}
      {view === 'leaderboard' && renderLeaderboard()}
    </div>
  );
};

export default Wallet;
