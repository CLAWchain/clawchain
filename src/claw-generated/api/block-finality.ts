import { Router } from 'express';
import { Chain } from '../Chain';
import { BlockFinality } from '../BlockFinality';

const router = Router();
const chain = new Chain();
const blockFinality = new BlockFinality();

router.get('/block/:hash/finality', async (req, res) => {
  const { hash } = req.params;
  const block = chain.getBlockByHash(hash);

  if (!block) {
    return res.status(404).json({ error: 'Block not found' });
  }

  const isFinalized = await blockFinality.isBlockFinalized(block);
  const confirmations = await blockFinality.getBlockConfirmations(block);

  return res.json({
    isFinalized,
    confirmations
  });
});

export default router;