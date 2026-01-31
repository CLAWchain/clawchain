import axios from 'axios';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  amount: number;
  status: string;
}

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
      const blocks = response.data.map((block: any): Block => ({
        height: block.height,
        hash: block.hash,
        timestamp: block.timestamp,
        transactions: block.transactions.length,
      }));

      return blocks;
    } catch (error) {
      console.error('Error fetching blocks:', error);
      return [];
    }
  }
}