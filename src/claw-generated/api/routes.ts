import { getBlockFinalityStatus } from '../block-finality';
import { get_transaction } from '../rpc_mod';
import { MemoryStore } from '../memory-store';
import { isValidBlockHash, sanitizeInput } from '../utils/input-validation';

const memoryStore = new MemoryStore();

export const routes = [
  {
    path: '/block/:hash/finality',
    method: 'GET',
    handler: (req, res) => {
      const { hash } = req.params;
      if (!isValidBlockHash(hash)) {
        return res.status(400).json({ error: 'Invalid block hash' });
      }
      const safeHash = sanitizeInput(hash);
      const finalityStatus = getBlockFinalityStatus(safeHash);
      res.json({ finalityStatus });
    }
  },
  {
    path: '/transaction/:signature',
    method: 'GET',
    handler: async (req, res) => {
      const { signature } = req.params;
      if (!isValidTransactionSignature(signature)) {
        return res.status(400).json({ error: 'Invalid transaction signature' });
      }
      const safeSignature = sanitizeInput(signature);
      const transaction = await get_transaction(&memoryStore, safeSignature);
      if (transaction) {
        res.json(transaction);
      } else {
        res.status(404).json({ error: 'Transaction not found' });
      }
    }
  },
  {
    path: '/health',
    method: 'GET',
    handler: (req, res) => {
      // Check overall node health
      const healthy = true; // Replace with actual health check logic
      res.json({ healthy });
    }
  },
  {
    path: '/ready',
    method: 'GET',
    handler: (req, res) => {
      // Check if the node is fully initialized and ready to process transactions
      const ready = true; // Replace with actual readiness check logic
      res.json({ ready });
    }
  }
];

function isValidBlockHash(hash: string): boolean {
  // Implement logic to validate block hash format
  return hash.length === 64 && /^[0-9a-f]+$/.test(hash);
}

function isValidTransactionSignature(signature: string): boolean {
  // Implement logic to validate transaction signature format
  return signature.length === 128 && /^[0-9a-f]+$/.test(signature);
}

function sanitizeInput(input: string): string {
  // Implement input sanitization logic to remove malicious characters
  return input.replace(/[<>]/g, '');
}