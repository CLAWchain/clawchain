import { getBlockFinalityStatus } from '../block-finality';
import { get_transaction } from '../rpc_mod';
import { MemoryStore } from '../memory-store';

const memoryStore = new MemoryStore();

export const routes = [
  {
    path: '/block/:hash/finality',
    method: 'GET',
    handler: (req, res) => {
      const { hash } = req.params;
      const finalityStatus = getBlockFinalityStatus(hash);
      res.json({ finalityStatus });
    }
  },
  {
    path: '/transaction/:signature',
    method: 'GET',
    handler: async (req, res) => {
      const { signature } = req.params;
      const transaction = await get_transaction(&memoryStore, signature);
      if (transaction) {
        res.json(transaction);
      } else {
        res.status(404).json({ error: 'Transaction not found' });
      }
    }
  }
];