import React, { useState, useEffect, useCallback } from 'react';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

interface WalletData {
  address: string;
  balance: number;
}

interface FaucetStatus {
  canClaim: boolean;
  nextClaimAt: number;
  faucetAmount: number;
}

interface PoolStats {
  totalStaked: number;
  totalStakers: number;
  totalRewardsPaid: number;
  apy: number;
  minStake: number;
}

interface StakingPosition {
  amount: number;
  staked_at: number;
  last_claim: number;
  total_rewards_claimed: number;
  pendingRewards: number;
  dailyReward: number;
  timeStaked: number;
}

interface StakingLeaderEntry {
  address: string;
  amount: number;
  total_rewards_claimed: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  hash: string;
  timestamp: number;
}

// Staking tier definitions
const STAKING_TIERS = [
  { name: 'Tier I', min: 10, max: 99, bonus: 0 },
  { name: 'Tier II', min: 100, max: 499, bonus: 0.5 },
  { name: 'Tier III', min: 500, max: 999, bonus: 1 },
  { name: 'Tier IV', min: 1000, max: 4999, bonus: 2 },
  { name: 'Tier V', min: 5000, max: Infinity, bonus: 3 },
];

export const Faucet: React.FC = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [faucetStatus, setFaucetStatus] = useState<FaucetStatus | null>(null);
  const [poolStats, setPoolStats] = useState<PoolStats | null>(null);
  const [stakingPosition, setStakingPosition] = useState<StakingPosition | null>(null);
  const [stakingLeaderboard, setStakingLeaderboard] = useState<StakingLeaderEntry[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Form states
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [activePanel, setActivePanel] = useState<'stake' | 'unstake' | 'compound'>('stake');
  
  // Animation states
  const [rewardTick, setRewardTick] = useState(0);

  // Load wallet from localStorage
  useEffect(() => {
    const savedWallet = localStorage.getItem('clawchain_wallet');
    if (savedWallet) {
      try {
        const parsed = JSON.parse(savedWallet);
        if (parsed.address) {
          fetchWalletBalance(parsed.address);
        }
      } catch (e) {
        console.error('Failed to parse saved wallet:', e);
      }
    }
    fetchPoolStats();
    fetchStakingLeaderboard();
  }, []);

  // Real-time reward ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setRewardTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate live pending rewards
  const getLivePendingRewards = useCallback(() => {
    if (!stakingPosition) return 0;
    const now = Date.now();
    const timeSinceLastClaim = now - stakingPosition.last_claim;
    const yearMs = 365 * 24 * 60 * 60 * 1000;
    const baseApy = 0.12;
    const tier = STAKING_TIERS.find(t => stakingPosition.amount >= t.min && stakingPosition.amount <= t.max);
    const bonusApy = tier ? tier.bonus / 100 : 0;
    const totalApy = baseApy + bonusApy;
    return (stakingPosition.amount * totalApy * timeSinceLastClaim) / yearMs;
  }, [stakingPosition, rewardTick]);

  useEffect(() => {
    if (wallet) {
      fetchFaucetStatus();
      fetchStakingPosition();
      fetchRecentTransactions();
      const interval = setInterval(() => {
        fetchFaucetStatus();
        fetchStakingPosition();
        fetchWalletBalance(wallet.address);
        fetchPoolStats();
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [wallet?.address]);

  const fetchWalletBalance = async (address: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/wallet/address/${address}`);
      const data = await res.json();
      if (data.success && data.wallet) {
        setWallet({ address, balance: data.wallet.balance || 0 });
      }
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
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

  const fetchPoolStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/wallet/staking/pool`);
      const data = await res.json();
      setPoolStats(data);
    } catch (error) {
      console.error('Failed to fetch pool stats:', error);
    }
  };

  const fetchStakingPosition = async () => {
    if (!wallet) return;
    try {
      const res = await fetch(`${API_BASE}/api/wallet/staking/position/${wallet.address}`);
      const data = await res.json();
      if (data.hasPosition) {
        setStakingPosition(data.position);
      } else {
        setStakingPosition(null);
      }
    } catch (error) {
      console.error('Failed to fetch staking position:', error);
    }
  };

  const fetchStakingLeaderboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/wallet/staking/leaderboard`);
      const data = await res.json();
      setStakingLeaderboard(data.stakers || []);
    } catch (error) {
      console.error('Failed to fetch staking leaderboard:', error);
    }
  };

  const fetchRecentTransactions = async () => {
    if (!wallet) return;
    try {
      const res = await fetch(`${API_BASE}/api/wallet/transactions/${wallet.address}`);
      const data = await res.json();
      setRecentTransactions((data.transactions || []).slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const claimFaucet = async () => {
    if (!wallet) return;
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/wallet/faucet/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: wallet.address })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `[+] Claimed ${data.amount} CLAW` });
        fetchWalletBalance(wallet.address);
        fetchFaucetStatus();
        fetchRecentTransactions();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to claim from faucet' });
    }
    setIsLoading(false);
  };

  const stakeTokens = async () => {
    if (!wallet || !stakeAmount) return;
    const amount = parseFloat(stakeAmount);
    if (amount < 10) {
      setMessage({ type: 'error', text: 'Minimum stake is 10 CLAW' });
      return;
    }
    if (amount > wallet.balance) {
      setMessage({ type: 'error', text: 'Insufficient balance' });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/wallet/staking/stake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: wallet.address, amount })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `[+] Staked ${amount} CLAW` });
        setStakeAmount('');
        fetchWalletBalance(wallet.address);
        fetchStakingPosition();
        fetchPoolStats();
        fetchRecentTransactions();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to stake' });
    }
    setIsLoading(false);
  };

  const claimRewards = async () => {
    if (!wallet) return;
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/wallet/staking/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: wallet.address })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `[+] Claimed ${data.rewards.toFixed(4)} CLAW rewards` });
        fetchWalletBalance(wallet.address);
        fetchStakingPosition();
        fetchRecentTransactions();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to claim rewards' });
    }
    setIsLoading(false);
  };

  const unstakeTokens = async (amount?: number) => {
    if (!wallet) return;
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/wallet/staking/unstake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address: wallet.address, 
          amount: amount || (unstakeAmount ? parseFloat(unstakeAmount) : undefined)
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `[+] Unstaked ${data.unstaked} CLAW` });
        setUnstakeAmount('');
        fetchWalletBalance(wallet.address);
        fetchStakingPosition();
        fetchPoolStats();
        fetchRecentTransactions();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to unstake' });
    }
    setIsLoading(false);
  };

  const compoundRewards = async () => {
    if (!wallet || !stakingPosition) return;
    const pendingRewards = getLivePendingRewards();
    if (pendingRewards < 0.01) {
      setMessage({ type: 'error', text: 'Minimum compound amount is 0.01 CLAW' });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    try {
      const claimRes = await fetch(`${API_BASE}/api/wallet/staking/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: wallet.address })
      });
      const claimData = await claimRes.json();
      
      if (claimData.success && claimData.rewards >= 0.01) {
        const stakeRes = await fetch(`${API_BASE}/api/wallet/staking/stake`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: wallet.address, amount: claimData.rewards })
        });
        const stakeData = await stakeRes.json();
        
        if (stakeData.success) {
          setMessage({ type: 'success', text: `[+] Compounded ${claimData.rewards.toFixed(4)} CLAW` });
          fetchWalletBalance(wallet.address);
          fetchStakingPosition();
          fetchPoolStats();
          fetchRecentTransactions();
        } else {
          setMessage({ type: 'success', text: `[+] Claimed ${claimData.rewards.toFixed(4)} CLAW` });
        }
      } else {
        setMessage({ type: 'error', text: claimData.error || 'Nothing to compound' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to compound' });
    }
    setIsLoading(false);
  };

  const formatTimeUntil = (timestamp: number) => {
    const now = Date.now();
    const diff = timestamp - now;
    if (diff <= 0) return 'Now';
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const formatDuration = (ms: number) => {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getCurrentTier = () => {
    if (!stakingPosition) return null;
    return STAKING_TIERS.find(t => stakingPosition.amount >= t.min && stakingPosition.amount <= t.max);
  };

  const getNextTier = () => {
    if (!stakingPosition) return STAKING_TIERS[0];
    const currentIndex = STAKING_TIERS.findIndex(t => stakingPosition.amount >= t.min && stakingPosition.amount <= t.max);
    return STAKING_TIERS[currentIndex + 1] || null;
  };

  // No wallet connected
  if (!wallet) {
    return (
      <div style={{
        padding: '30px',
        height: '100%',
        overflowY: 'auto',
        fontFamily: 'JetBrains Mono, monospace',
        color: 'var(--cc-text-primary)',
        backgroundColor: 'var(--cc-bg-primary)'
      }}>
        <div style={{
          maxWidth: '500px',
          margin: '60px auto',
          textAlign: 'center',
          padding: '40px',
          background: 'var(--cc-bg-secondary)',
          border: '1px dashed var(--cc-coral)',
          borderRadius: '4px'
        }}>
          <div style={{ fontSize: '32px', color: 'var(--cc-coral)', marginBottom: '20px', fontFamily: 'monospace' }}>{'<>'}</div>
          <h2 style={{ color: 'var(--cc-text-primary)', margin: '0 0 12px', fontSize: '16px' }}>
            WALLET NOT CONNECTED
          </h2>
          <p style={{ color: 'var(--cc-text-muted)', margin: '0 0 24px', fontSize: '12px' }}>
            Create or import a wallet to access the faucet and staking pool.
          </p>
          <a
            href="/wallet"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: 'var(--cc-coral)',
              border: 'none',
              borderRadius: '4px',
              color: 'var(--cc-bg-primary)',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            CONNECT WALLET
          </a>
        </div>
      </div>
    );
  }

  const livePendingRewards = getLivePendingRewards();
  const currentTier = getCurrentTier();
  const nextTier = getNextTier();

  return (
    <div style={{
      padding: '20px',
      height: '100%',
      overflowY: 'auto',
      fontFamily: 'JetBrains Mono, monospace',
      color: 'var(--cc-text-primary)',
      backgroundColor: 'var(--cc-bg-primary)'
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '1px',
          background: 'var(--cc-border)',
          border: '1px solid var(--cc-border)',
          marginBottom: '20px'
        }}>
          {[
            { label: 'BALANCE', value: wallet.balance.toLocaleString(), suffix: 'CLAW' },
            { label: 'TOTAL STAKED', value: poolStats?.totalStaked?.toLocaleString() || '0', suffix: 'CLAW' },
            { label: 'APY', value: `${poolStats?.apy || 12}%`, suffix: '+ BONUS' },
            { label: 'STAKERS', value: poolStats?.totalStakers || 0, suffix: 'ACTIVE' },
            { label: 'REWARDS PAID', value: poolStats?.totalRewardsPaid?.toFixed(2) || '0', suffix: 'CLAW' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'var(--cc-bg-secondary)',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{ color: 'var(--cc-text-muted)', fontSize: '9px', marginBottom: '6px', letterSpacing: '1px' }}>
                {stat.label}
              </div>
              <div style={{ color: 'var(--cc-coral)', fontSize: '18px', fontWeight: 700 }}>
                {stat.value}
              </div>
              <div style={{ color: 'var(--cc-text-muted)', fontSize: '9px', marginTop: '2px' }}>
                {stat.suffix}
              </div>
            </div>
          ))}
        </div>

        {message && (
          <div style={{
            padding: '12px 16px',
            marginBottom: '16px',
            background: 'var(--cc-bg-secondary)',
            border: `1px solid ${message.type === 'success' ? 'var(--cc-coral)' : '#ff6464'}`,
            color: message.type === 'success' ? 'var(--cc-coral)' : '#ff6464',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            {message.text}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Faucet */}
            <div style={{
              background: 'var(--cc-bg-secondary)',
              border: '1px solid var(--cc-border)',
              padding: '24px'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: '1px solid var(--cc-border)',
                paddingBottom: '12px',
                marginBottom: '20px'
              }}>
                <span style={{ color: 'var(--cc-coral)', fontSize: '12px', fontWeight: 600 }}>FAUCET</span>
                <span style={{ 
                  color: faucetStatus?.canClaim ? 'var(--cc-coral)' : 'var(--cc-text-muted)', 
                  fontSize: '10px' 
                }}>
                  {faucetStatus?.canClaim ? '[READY]' : '[COOLDOWN]'}
                </span>
              </div>

              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ color: 'var(--cc-text-muted)', fontSize: '10px', marginBottom: '8px' }}>
                  CLAIM AMOUNT
                </div>
                <div style={{ color: 'var(--cc-text-primary)', fontSize: '32px', fontWeight: 700, marginBottom: '4px' }}>
                  100 <span style={{ color: 'var(--cc-coral)', fontSize: '16px' }}>CLAW</span>
                </div>
                <div style={{ color: 'var(--cc-text-muted)', fontSize: '10px', marginBottom: '24px' }}>
                  every 24 hours
                </div>

                <button
                  onClick={claimFaucet}
                  disabled={isLoading || !faucetStatus?.canClaim}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: (isLoading || !faucetStatus?.canClaim) ? 'var(--cc-bg-tertiary)' : 'var(--cc-coral)',
                    border: '1px solid var(--cc-border)',
                    color: (isLoading || !faucetStatus?.canClaim) ? 'var(--cc-text-muted)' : 'var(--cc-bg-primary)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: (isLoading || !faucetStatus?.canClaim) ? 'not-allowed' : 'pointer',
                    fontFamily: 'JetBrains Mono, monospace'
                  }}
                >
                  {isLoading ? 'CLAIMING...' : faucetStatus?.canClaim ? 'CLAIM CLAW' : `WAIT ${formatTimeUntil(faucetStatus?.nextClaimAt || 0)}`}
                </button>
              </div>
            </div>

            {/* Your Position */}
            {stakingPosition && (
              <div style={{
                background: 'var(--cc-bg-secondary)',
                border: '1px solid var(--cc-coral)',
                padding: '24px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  borderBottom: '1px solid var(--cc-border)',
                  paddingBottom: '12px',
                  marginBottom: '16px'
                }}>
                  <span style={{ color: 'var(--cc-coral)', fontSize: '12px', fontWeight: 600 }}>YOUR POSITION</span>
                  <span style={{ color: 'var(--cc-text-muted)', fontSize: '10px' }}>
                    [{currentTier?.name || 'TIER I'}]
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ textAlign: 'center', padding: '12px', background: 'var(--cc-bg-tertiary)' }}>
                    <div style={{ color: 'var(--cc-text-muted)', fontSize: '9px', marginBottom: '4px' }}>STAKED</div>
                    <div style={{ color: 'var(--cc-text-primary)', fontSize: '16px', fontWeight: 700 }}>
                      {stakingPosition.amount.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px', background: 'var(--cc-bg-tertiary)' }}>
                    <div style={{ color: 'var(--cc-text-muted)', fontSize: '9px', marginBottom: '4px' }}>PENDING</div>
                    <div style={{ color: 'var(--cc-coral)', fontSize: '16px', fontWeight: 700 }}>
                      +{livePendingRewards.toFixed(6)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px', background: 'var(--cc-bg-tertiary)' }}>
                    <div style={{ color: 'var(--cc-text-muted)', fontSize: '9px', marginBottom: '4px' }}>DAILY</div>
                    <div style={{ color: 'var(--cc-text-primary)', fontSize: '16px', fontWeight: 700 }}>
                      ~{stakingPosition.dailyReward.toFixed(4)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px', background: 'var(--cc-bg-tertiary)' }}>
                    <div style={{ color: 'var(--cc-text-muted)', fontSize: '9px', marginBottom: '4px' }}>DURATION</div>
                    <div style={{ color: 'var(--cc-text-primary)', fontSize: '16px', fontWeight: 700 }}>
                      {formatDuration(stakingPosition.timeStaked)}
                    </div>
                  </div>
                </div>

                {nextTier && (
                  <div style={{ marginBottom: '16px', fontSize: '10px', color: 'var(--cc-text-muted)', textAlign: 'center' }}>
                    {(nextTier.min - stakingPosition.amount).toLocaleString()} CLAW to {nextTier.name} (+{nextTier.bonus}% bonus)
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <button
                    onClick={claimRewards}
                    disabled={isLoading || livePendingRewards < 0.01}
                    style={{
                      padding: '10px',
                      background: 'var(--cc-bg-tertiary)',
                      border: '1px solid var(--cc-border)',
                      color: (isLoading || livePendingRewards < 0.01) ? 'var(--cc-text-muted)' : 'var(--cc-coral)',
                      fontSize: '10px',
                      fontWeight: 600,
                      cursor: (isLoading || livePendingRewards < 0.01) ? 'not-allowed' : 'pointer',
                      fontFamily: 'JetBrains Mono, monospace'
                    }}
                  >
                    CLAIM
                  </button>
                  <button
                    onClick={compoundRewards}
                    disabled={isLoading || livePendingRewards < 0.01}
                    style={{
                      padding: '10px',
                      background: 'var(--cc-bg-tertiary)',
                      border: '1px solid var(--cc-border)',
                      color: (isLoading || livePendingRewards < 0.01) ? 'var(--cc-text-muted)' : 'var(--cc-coral)',
                      fontSize: '10px',
                      fontWeight: 600,
                      cursor: (isLoading || livePendingRewards < 0.01) ? 'not-allowed' : 'pointer',
                      fontFamily: 'JetBrains Mono, monospace'
                    }}
                  >
                    COMPOUND
                  </button>
                  <button
                    onClick={() => unstakeTokens()}
                    disabled={isLoading}
                    style={{
                      padding: '10px',
                      background: 'var(--cc-bg-tertiary)',
                      border: '1px solid var(--cc-border)',
                      color: 'var(--cc-text-secondary)',
                      fontSize: '10px',
                      fontWeight: 600,
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      fontFamily: 'JetBrains Mono, monospace'
                    }}
                  >
                    UNSTAKE
                  </button>
                </div>

                <div style={{ marginTop: '12px', textAlign: 'center', color: 'var(--cc-text-muted)', fontSize: '9px' }}>
                  APY: {(12 + (currentTier?.bonus || 0)).toFixed(1)}% | Claimed: {stakingPosition.total_rewards_claimed.toFixed(4)}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div style={{
              background: 'var(--cc-bg-secondary)',
              border: '1px solid var(--cc-border)',
              padding: '24px'
            }}>
              <div style={{ 
                borderBottom: '1px solid var(--cc-border)',
                paddingBottom: '12px',
                marginBottom: '16px'
              }}>
                <span style={{ color: 'var(--cc-text-primary)', fontSize: '12px', fontWeight: 600 }}>RECENT ACTIVITY</span>
              </div>
              
              {recentTransactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--cc-text-muted)', fontSize: '11px' }}>
                  No recent activity
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recentTransactions.map((tx, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px',
                      background: 'var(--cc-bg-tertiary)',
                      fontSize: '11px'
                    }}>
                      <div>
                        <span style={{ color: 'var(--cc-text-primary)', textTransform: 'uppercase' }}>{tx.type}</span>
                        <span style={{ color: 'var(--cc-text-muted)', marginLeft: '8px' }}>{formatTimeAgo(tx.timestamp)}</span>
                      </div>
                      <span style={{ color: ['faucet', 'receive', 'reward', 'unstake'].includes(tx.type) ? 'var(--cc-coral)' : 'var(--cc-text-muted)' }}>
                        {['faucet', 'receive', 'reward', 'unstake'].includes(tx.type) ? '+' : '-'}{tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Stake Panel */}
            <div style={{
              background: 'var(--cc-bg-secondary)',
              border: '1px solid var(--cc-border)'
            }}>
              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--cc-border)' }}>
                {['stake', 'unstake', 'compound'].map(panel => (
                  <button
                    key={panel}
                    onClick={() => setActivePanel(panel as any)}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: activePanel === panel ? 'var(--cc-bg-tertiary)' : 'transparent',
                      border: 'none',
                      borderBottom: activePanel === panel ? '2px solid var(--cc-coral)' : '2px solid transparent',
                      color: activePanel === panel ? 'var(--cc-coral)' : 'var(--cc-text-muted)',
                      fontSize: '10px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'JetBrains Mono, monospace',
                      textTransform: 'uppercase'
                    }}
                  >
                    {panel}
                  </button>
                ))}
              </div>

              <div style={{ padding: '24px' }}>
                {activePanel === 'stake' && (
                  <>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: 'var(--cc-text-muted)', fontSize: '10px' }}>AMOUNT</span>
                        <span style={{ color: 'var(--cc-text-muted)', fontSize: '10px' }}>
                          Available: {wallet.balance.toLocaleString()}
                        </span>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          value={stakeAmount}
                          onChange={e => setStakeAmount(e.target.value)}
                          placeholder="0"
                          style={{
                            width: '100%',
                            padding: '14px',
                            paddingRight: '70px',
                            background: 'var(--cc-bg-tertiary)',
                            border: '1px solid var(--cc-border)',
                            color: 'var(--cc-text-primary)',
                            fontSize: '16px',
                            fontFamily: 'JetBrains Mono, monospace',
                            boxSizing: 'border-box'
                          }}
                        />
                        <button
                          onClick={() => setStakeAmount(wallet.balance.toString())}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: '1px solid var(--cc-coral)',
                            color: 'var(--cc-coral)',
                            padding: '4px 10px',
                            fontSize: '9px',
                            cursor: 'pointer',
                            fontFamily: 'JetBrains Mono, monospace'
                          }}
                        >
                          MAX
                        </button>
                      </div>
                      <div style={{ color: 'var(--cc-text-muted)', fontSize: '9px', marginTop: '6px' }}>
                        Minimum: 10 CLAW
                      </div>
                    </div>

                    {stakeAmount && parseFloat(stakeAmount) >= 10 && (
                      <div style={{
                        background: 'var(--cc-bg-tertiary)',
                        padding: '14px',
                        marginBottom: '16px',
                        fontSize: '10px'
                      }}>
                        <div style={{ color: 'var(--cc-text-muted)', marginBottom: '8px' }}>ESTIMATED RETURNS</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                          <div>
                            <div style={{ color: 'var(--cc-text-muted)', fontSize: '9px' }}>DAILY</div>
                            <div style={{ color: 'var(--cc-coral)' }}>+{((parseFloat(stakeAmount) * 0.12) / 365).toFixed(4)}</div>
                          </div>
                          <div>
                            <div style={{ color: 'var(--cc-text-muted)', fontSize: '9px' }}>MONTHLY</div>
                            <div style={{ color: 'var(--cc-coral)' }}>+{((parseFloat(stakeAmount) * 0.12) / 12).toFixed(2)}</div>
                          </div>
                          <div>
                            <div style={{ color: 'var(--cc-text-muted)', fontSize: '9px' }}>YEARLY</div>
                            <div style={{ color: 'var(--cc-coral)' }}>+{(parseFloat(stakeAmount) * 0.12).toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={stakeTokens}
                      disabled={isLoading || !stakeAmount || parseFloat(stakeAmount) < 10 || parseFloat(stakeAmount) > wallet.balance}
                      style={{
                        width: '100%',
                        padding: '14px',
                        background: (isLoading || !stakeAmount || parseFloat(stakeAmount) < 10) ? 'var(--cc-bg-tertiary)' : 'var(--cc-coral)',
                        border: '1px solid var(--cc-border)',
                        color: (isLoading || !stakeAmount || parseFloat(stakeAmount) < 10) ? 'var(--cc-text-muted)' : 'var(--cc-bg-primary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: (isLoading || !stakeAmount || parseFloat(stakeAmount) < 10) ? 'not-allowed' : 'pointer',
                        fontFamily: 'JetBrains Mono, monospace'
                      }}
                    >
                      {isLoading ? 'STAKING...' : 'STAKE CLAW'}
                    </button>
                  </>
                )}

                {activePanel === 'unstake' && (
                  <>
                    {!stakingPosition ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--cc-text-muted)', fontSize: '11px' }}>
                        No staking position
                      </div>
                    ) : (
                      <>
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: 'var(--cc-text-muted)', fontSize: '10px' }}>AMOUNT</span>
                            <span style={{ color: 'var(--cc-text-muted)', fontSize: '10px' }}>
                              Staked: {stakingPosition.amount.toLocaleString()}
                            </span>
                          </div>
                          <div style={{ position: 'relative' }}>
                            <input
                              type="number"
                              value={unstakeAmount}
                              onChange={e => setUnstakeAmount(e.target.value)}
                              placeholder="0 (all)"
                              style={{
                                width: '100%',
                                padding: '14px',
                                paddingRight: '70px',
                                background: 'var(--cc-bg-tertiary)',
                                border: '1px solid var(--cc-border)',
                                color: 'var(--cc-text-primary)',
                                fontSize: '16px',
                                fontFamily: 'JetBrains Mono, monospace',
                                boxSizing: 'border-box'
                              }}
                            />
                            <button
                              onClick={() => setUnstakeAmount(stakingPosition.amount.toString())}
                              style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'transparent',
                                border: '1px solid var(--cc-coral)',
                                color: 'var(--cc-coral)',
                                padding: '4px 10px',
                                fontSize: '9px',
                                cursor: 'pointer',
                                fontFamily: 'JetBrains Mono, monospace'
                              }}
                            >
                              MAX
                            </button>
                          </div>
                        </div>

                        <div style={{
                          background: 'var(--cc-bg-tertiary)',
                          padding: '12px',
                          marginBottom: '16px',
                          fontSize: '10px',
                          color: 'var(--cc-coral)'
                        }}>
                          Pending rewards (+{livePendingRewards.toFixed(4)}) will be claimed
                        </div>

                        <button
                          onClick={() => unstakeTokens(parseFloat(unstakeAmount) || undefined)}
                          disabled={isLoading}
                          style={{
                            width: '100%',
                            padding: '14px',
                            background: isLoading ? 'var(--cc-bg-tertiary)' : 'var(--cc-coral)',
                            border: '1px solid var(--cc-border)',
                            color: isLoading ? 'var(--cc-text-muted)' : 'var(--cc-bg-primary)',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            fontFamily: 'JetBrains Mono, monospace'
                          }}
                        >
                          {isLoading ? 'UNSTAKING...' : unstakeAmount ? `UNSTAKE ${unstakeAmount}` : 'UNSTAKE ALL'}
                        </button>
                      </>
                    )}
                  </>
                )}

                {activePanel === 'compound' && (
                  <>
                    {!stakingPosition ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--cc-text-muted)', fontSize: '11px' }}>
                        Stake first to compound
                      </div>
                    ) : (
                      <>
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                          <div style={{ color: 'var(--cc-text-muted)', fontSize: '10px', marginBottom: '8px' }}>
                            PENDING REWARDS
                          </div>
                          <div style={{ color: 'var(--cc-coral)', fontSize: '28px', fontWeight: 700 }}>
                            +{livePendingRewards.toFixed(6)}
                          </div>
                          <div style={{ color: 'var(--cc-text-muted)', fontSize: '10px' }}>CLAW</div>
                        </div>

                        <div style={{
                          background: 'var(--cc-bg-tertiary)',
                          padding: '14px',
                          marginBottom: '20px',
                          fontSize: '10px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: 'var(--cc-text-muted)' }}>Current Position</span>
                            <span style={{ color: 'var(--cc-text-primary)' }}>{stakingPosition.amount.toLocaleString()}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--cc-text-muted)' }}>After Compound</span>
                            <span style={{ color: 'var(--cc-coral)' }}>{(stakingPosition.amount + livePendingRewards).toFixed(4)}</span>
                          </div>
                        </div>

                        <button
                          onClick={compoundRewards}
                          disabled={isLoading || livePendingRewards < 0.01}
                          style={{
                            width: '100%',
                            padding: '14px',
                            background: (isLoading || livePendingRewards < 0.01) ? 'var(--cc-bg-tertiary)' : 'var(--cc-coral)',
                            border: '1px solid var(--cc-border)',
                            color: (isLoading || livePendingRewards < 0.01) ? 'var(--cc-text-muted)' : 'var(--cc-bg-primary)',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: (isLoading || livePendingRewards < 0.01) ? 'not-allowed' : 'pointer',
                            fontFamily: 'JetBrains Mono, monospace'
                          }}
                        >
                          {isLoading ? 'COMPOUNDING...' : livePendingRewards < 0.01 ? 'MIN 0.01' : 'COMPOUND'}
                        </button>

                        <div style={{ marginTop: '12px', textAlign: 'center', color: 'var(--cc-text-muted)', fontSize: '9px' }}>
                          Adds rewards to your staked position
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Tiers */}
            <div style={{
              background: 'var(--cc-bg-secondary)',
              border: '1px solid var(--cc-border)',
              padding: '24px'
            }}>
              <div style={{ 
                borderBottom: '1px solid var(--cc-border)',
                paddingBottom: '12px',
                marginBottom: '16px'
              }}>
                <span style={{ color: 'var(--cc-text-primary)', fontSize: '12px', fontWeight: 600 }}>STAKING TIERS</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {STAKING_TIERS.map((tier, i) => {
                  const isCurrentTier = currentTier?.name === tier.name;
                  return (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      background: isCurrentTier ? 'var(--cc-bg-tertiary)' : 'transparent',
                      border: isCurrentTier ? '1px solid var(--cc-coral)' : '1px solid var(--cc-border)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ 
                          color: isCurrentTier ? 'var(--cc-coral)' : 'var(--cc-text-muted)', 
                          fontSize: '10px',
                          width: '60px'
                        }}>
                          {tier.name}
                        </span>
                        <span style={{ color: 'var(--cc-text-muted)', fontSize: '10px' }}>
                          {tier.min.toLocaleString()}+ CLAW
                        </span>
                      </div>
                      <span style={{ color: 'var(--cc-coral)', fontSize: '12px', fontWeight: 600 }}>
                        {(12 + tier.bonus).toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Leaderboard */}
            <div style={{
              background: 'var(--cc-bg-secondary)',
              border: '1px solid var(--cc-border)',
              padding: '24px'
            }}>
              <div style={{ 
                borderBottom: '1px solid var(--cc-border)',
                paddingBottom: '12px',
                marginBottom: '16px'
              }}>
                <span style={{ color: 'var(--cc-text-primary)', fontSize: '12px', fontWeight: 600 }}>TOP STAKERS</span>
              </div>
              
              {stakingLeaderboard.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--cc-text-muted)', fontSize: '11px' }}>
                  No stakers yet
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {stakingLeaderboard.slice(0, 5).map((entry, i) => {
                    const isYou = wallet?.address === entry.address;
                    return (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px',
                        background: isYou ? 'var(--cc-bg-tertiary)' : 'transparent',
                        border: isYou ? '1px solid var(--cc-coral)' : '1px solid transparent'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: 'var(--cc-text-muted)', fontSize: '10px', width: '20px' }}>
                            {i + 1}.
                          </span>
                          <span style={{ 
                            color: isYou ? 'var(--cc-coral)' : 'var(--cc-text-secondary)', 
                            fontSize: '10px',
                            fontFamily: 'monospace'
                          }}>
                            {entry.address.slice(0, 12)}...
                            {isYou && ' (you)'}
                          </span>
                        </div>
                        <span style={{ color: 'var(--cc-text-primary)', fontSize: '11px', fontWeight: 600 }}>
                          {entry.amount.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faucet;
