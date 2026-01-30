import React, { useState, useEffect } from 'react';
import { fetchNetworkStats } from '../api/network';

interface NetworkStatsProps {}

const NetworkStats: React.FC<NetworkStatsProps> = () => {
  const [stats, setStats] = useState({
    tps: 0,
    blockTime: 0,
    difficulty: 0,
    hashrate: 0,
    activeAddresses: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const networkStats = await fetchNetworkStats();
      setStats(networkStats);
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="network-stats">
      <h2>Network Stats</h2>
      <div>
        <h3>Transactions per Second</h3>
        <p>{stats.tps.toFixed(2)}</p>
      </div>
      <div>
        <h3>Average Block Time</h3>
        <p>{stats.blockTime.toFixed(2)} seconds</p>
      </div>
      <div>
        <h3>Mining Difficulty</h3>
        <p>{stats.difficulty.toFixed(2)}</p>
      </div>
      <div>
        <h3>Network Hashrate</h3>
        <p>{stats.hashrate.toFixed(2)} H/s</p>
      </div>
      <div>
        <h3>Active Addresses</h3>
        <p>{stats.activeAddresses.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default NetworkStats;