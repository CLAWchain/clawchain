import React from 'react';
import NetworkStats from './NetworkStats';

const NetworkStatsBoard: React.FC = () => {
  return (
    <div className="network-stats-board">
      <h1>Network Stats</h1>
      <NetworkStats />
    </div>
  );
};

export default NetworkStatsBoard;