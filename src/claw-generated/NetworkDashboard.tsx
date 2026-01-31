import React, { useState, useEffect } from 'react';
import { fetchNetworkStats } from '../explorer/api';

interface NetworkStats {
  tps: number;
  blockTime: number;
  difficulty: number;
  hashrate: number;
  activeAddresses: number;
}

const NetworkDashboard: React.FC = () => {
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    tps: 0,
    blockTime: 0,
    difficulty: 0,
    hashrate: 0,
    activeAddresses: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const stats = await fetchNetworkStats();
      setNetworkStats(stats);
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2>Network Stats</h2>
      <div>
        <h3>Transactions per Second (TPS)</h3>
        <p>{networkStats.tps}</p>
      </div>
      <div>
        <h3>Block Time</h3>
        <p>{networkStats.blockTime} seconds</p>
      </div>
      <div>
        <h3>Difficulty</h3>
        <p>{networkStats.difficulty}</p>
      </div>
      <div>
        <h3>Hashrate</h3>
        <p>{networkStats.hashrate} H/s</p>
      </div>
      <div>
        <h3>Active Addresses</h3>
        <p>{networkStats.activeAddresses}</p>
      </div>
    </div>
  );
};

export default NetworkDashboard;