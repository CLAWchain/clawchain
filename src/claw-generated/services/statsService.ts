import axios from 'axios';

export const fetchNetworkStats = async () =&gt; {
  const response = await axios.get('/api/network-stats');
  return {
    tps: response.data.transactionsPerSecond,
    blockTime: response.data.averageBlockTime,
    difficulty: response.data.difficulty,
    hashrate: response.data.hashrate,
    activeAddresses: response.data.activeAddresses,
  };
};