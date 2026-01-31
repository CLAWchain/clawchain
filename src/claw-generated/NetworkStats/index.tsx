import React, { useState, useEffect } from 'react';
import { fetchNetworkStats } from '../services/statsService';

interface NetworkStatsProps {
  // Add any necessary props
}

const NetworkStats: React.FC<NetworkStatsProps> = () => {
  const [stats, setStats] = useState({
    tps: 0,
    blockTime: 0,
    difficulty: 0,
    hashrate: 0,
    activeAddresses: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      const networkStats = await fetchNetworkStats();
      setStats(networkStats);
    };
    fetchData();
  }, []);

  return (
    <div className="network-stats-container">
      <h2>Network Statistics</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>TPS</h3>
          <p>{stats.tps}</p>
        </div>
        <div className="stat-card">
          <h3>Block Time</h3>
          <p>{stats.blockTime} seconds</p>
        </div>
        <div className="stat-card">
          <h3>Difficulty</h3>
          <p>{stats.difficulty}</p>
        </div>
        <div className="stat-card">
          <h3>Hashrate</h3>
          <p>{stats.hashrate} H/s</p>
        </div>
        <div className="stat-card">
          <h3>Active Addresses</h3>
          <p>{stats.activeAddresses}</p>
        </div>
      </div>
    </div>
  );
};

export default NetworkStats;