import React, { useState, useEffect } from 'react';
import { fetchNetworkStats } from '../api/networkStats';

interface NetworkStats {
  tps: number;
  blockTime: number;
  difficulty: number;
  hashrate: number;
  activeAddresses: number;
}

const NetworkStatsPage: React.FC = () => {
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    tps: 0,
    blockTime: 0,
    difficulty: 0,
    hashrate: 0,
    activeAddresses: 0
  });

  useEffect(() => {
    const interval = setInterval(async () => {
      const stats = await fetchNetworkStats();
      setNetworkStats(stats);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>ClawChain Network Stats</h1>
      <div>
        <h2>Transactions per Second (TPS)</h2>
        <p>{networkStats.tps.toFixed(2)}</p>
      </div>
      <div>
        <h2>Average Block Time</h2>
        <p>{networkStats.blockTime.toFixed(2)} seconds</p>
      </div>
      <div>
        <h2>Difficulty</h2>
        <p>{networkStats.difficulty.toFixed(2)}</p>
      </div>
      <div>
        <h2>Hashrate</h2>
        <p>{networkStats.hashrate.toFixed(2)} GH/s</p>
      </div>
      <div>
        <h2>Active Addresses</h2>
        <p>{networkStats.activeAddresses}</p>
      </div>
    </div>
  );
};

export default NetworkStatsPage;