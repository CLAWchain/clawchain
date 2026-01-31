import React, { useState, useEffect } from 'react';
import { getTransactionVolume, getBlockTime, getDifficulty, getHashrate, getActiveAddresses } from './blockchain';

const NetworkStatsBoard: React.FC = () => {
  const [tps, setTps] = useState(0);
  const [blockTime, setBlockTime] = useState(0);
  const [difficulty, setDifficulty] = useState(0);
  const [hashrate, setHashrate] = useState(0);
  const [activeAddresses, setActiveAddresses] = useState(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      setTps(await getTransactionVolume());
      setBlockTime(await getBlockTime());
      setDifficulty(await getDifficulty());
      setHashrate(await getHashrate());
      setActiveAddresses(await getActiveAddresses());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="network-stats-board">
      <div className="stat">
        <h3>TPS</h3>
        <p>{tps.toFixed(2)}</p>
      </div>
      <div className="stat">
        <h3>Block Time</h3>
        <p>{blockTime.toFixed(2)} s</p>
      </div>
      <div className="stat">
        <h3>Difficulty</h3>
        <p>{difficulty.toFixed(2)}</p>
      </div>
      <div className="stat">
        <h3>Hashrate</h3>
        <p>{hashrate.toFixed(2)} H/s</p>
      </div>
      <div className="stat">
        <h3>Active Addresses</h3>
        <p>{activeAddresses}</p>
      </div>
    </div>
  );
};

export default NetworkStatsBoard;