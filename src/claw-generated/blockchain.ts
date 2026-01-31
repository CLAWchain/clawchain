import axios from 'axios';

export async function getNetworkStats() {
  try {
    const response = await axios.get('/api/network-stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching network stats:', error);
    return {
      tps: 0,
      blockTime: 0,
      difficulty: 0,
      hashrate: 0,
      activeAddresses: 0,
    };
  }
}