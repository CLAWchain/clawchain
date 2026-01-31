import React, { useState, useEffect } from 'react';
import { fetchNetworkStats } from '../services/statsService';

interface NetworkStatsProps {}

const NetworkStats: React.FC&lt;NetworkStatsProps&gt; = () =&gt; {
  const [stats, setStats] = useState&lt;{
    tps: number;
    blockTime: number;
    difficulty: number;
    hashrate: number;
    activeAddresses: number;
  }&gt;({
    tps: 0,
    blockTime: 0,
    difficulty: 0,
    hashrate: 0,
    activeAddresses: 0,
  });

  useEffect(() =&gt; {
    const fetchStats = async () =&gt; {
      const networkStats = await fetchNetworkStats();
      setStats(networkStats);
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () =&gt; clearInterval(interval);
  }, []);

  return (
    &lt;div&gt;
      &lt;h1&gt;ClawChain Network Stats&lt;/h1&gt;
      &lt;div&gt;
        &lt;h2&gt;Transactions per Second (TPS)&lt;/h2&gt;
        &lt;p&gt;{stats.tps}&lt;/p&gt;
      &lt;/div&gt;
      &lt;div&gt;
        &lt;h2&gt;Average Block Time&lt;/h2&gt;
        &lt;p&gt;{stats.blockTime} seconds&lt;/p&gt;
      &lt;/div&gt;
      &lt;div&gt;
        &lt;h2&gt;Network Difficulty&lt;/h2&gt;
        &lt;p&gt;{stats.difficulty}&lt;/p&gt;
      &lt;/div&gt;
      &lt;div&gt;
        &lt;h2&gt;Hashrate&lt;/h2&gt;
        &lt;p&gt;{stats.hashrate} H/s&lt;/p&gt;
      &lt;/div&gt;
      &lt;div&gt;
        &lt;h2&gt;Active Addresses&lt;/h2&gt;
        &lt;p&gt;{stats.activeAddresses}&lt;/p&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
};

export default NetworkStats;