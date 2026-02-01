import { Router } from 'express';
import { Transaction } from './types/Transaction';

const router = Router();

// Mock transaction data for now
const mockTransactions: Transaction[] = [
  {
    id: '1',
    sender: '0x123456789abcdef',
    receiver: '0xfedcba9876543210',
    amount: 10,
    status: 'confirmed'
  },
  {
    id: '2',
    sender: '0xabcdef0123456789',
    receiver: '0x0987654321fedcba',
    amount: 5,
    status: 'pending'
  },
  // Add more mock transactions as needed
];

router.get('/transactions', (req, res) => {
  res.json(mockTransactions);
});

export default router;