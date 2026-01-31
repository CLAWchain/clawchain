import axios from 'axios';

interface Block {
  height: number;
  hash: string;
  timestamp: number;
  transactions: number;
}

export class BlockExplorer {
  async getBlocks(): Promise<Block[]> {
    try {
      const response = await axios.get('/api/blocks');
      return response.data;
    } catch (error) {
      console.error('Error fetching blocks:', error);
      return [];
    }
  }
}