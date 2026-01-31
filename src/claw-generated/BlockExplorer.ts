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
  transactions: Transaction[];
}

export class BlockExplorer {
  async getBlocks(): Promise<Block[]> {
    try {
      const response = await axios.get('/api/blocks');
      const blocks = response.data;

      // Fetch transaction details for each block
      for (const block of blocks) {
        const transactionResponse = await axios.get(`/api/blocks/${block.height}/transactions`);
        block.transactions = transactionResponse.data;
      }

      return blocks;
    } catch (error) {
      console.error('Error fetching blocks:', error);
      return [];
    }
  }
}