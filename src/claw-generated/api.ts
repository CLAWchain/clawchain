import axios from 'axios';

interface NetworkStats {
  tps: number;
  blockTime: number;
  difficulty: number;
  hashrate: number;
  activeAddresses: number;
}

export const fetchNetworkStats = async (): Promise<NetworkStats> => {
  const response = await axios.get('/api/network-stats');
  return response.data;
};