import express, { Request, Response } from 'express';
import { Block } from '../../../src/types';

const router = express.Router();

// Mock data for now, replace with real block data
const mockBlocks: Block[] = [
  {
    height: 1,
    hash: '0x1234567890abcdef',
    transactions: [
      { id: '0x1', from: '0x123', to: '0x456', amount: 10 },
      { id: '0x2', from: '0x789', to: '0x012', amount: 5 },
    ],
    timestamp: new Date().getTime(),
  },
  {
    height: 2,
    hash: '0xfedcba0987654321',
    transactions: [
      { id: '0x3', from: '0x345', to: '0x678', amount: 20 },
    ],
    timestamp: new Date().getTime() - 60000, // 1 minute ago
  },
];

router.get('/api/blocks', (req: Request, res: Response) => {
  res.json(mockBlocks);
});

export default router;