import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface NetworkStats {
  tps: number;
  blockTime: number;
  difficulty: number;
  hashrate: number;
  activeAddresses: number;
}

const NetworkStatsPanel: React.FC = () => {
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    tps: 0,
    blockTime: 0,
    difficulty: 0,
    hashrate: 0,
    activeAddresses: 0,
  });

  useEffect(() => {
    const fetchNetworkStats = async () => {
      try {
        const response = await axios.get('/api/network/stats');
        setNetworkStats(response.data);
      } catch (error) {
        console.error('Error fetching network stats:', error);
      }
    };

    const interval = setInterval(fetchNetworkStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="network-stats-panel">
      <h2>Network Stats</h2>
      <div className="stats-container">
        <div className="stat">
          <h3>TPS</h3>
          <p>{networkStats.tps.toFixed(2)}</p>
        </div>
        <div className="stat">
          <h3>Block Time</h3>
          <p>{networkStats.blockTime.toFixed(2)} s</p>
        </div>
        <div className="stat">
          <h3>Difficulty</h3>
          <p>{networkStats.difficulty.toFixed(2)}</p>
        </div>
        <div className="stat">
          <h3>Hashrate</h3>
          <p>{networkStats.hashrate.toFixed(2)} H/s</p>
        </div>
        <div className="stat">
          <h3>Active Addresses</h3>
          <p>{networkStats.activeAddresses}</p>
        </div>
      </div>
    </div>
  );
};

export default NetworkStatsPanel;