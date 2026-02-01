import { getBlockFinalityStatus } from '../block-finality';

export const routes = [
  {
    path: '/block/:hash/finality',
    method: 'GET',
    handler: (req, res) => {
      const { hash } = req.params;
      const finalityStatus = getBlockFinalityStatus(hash);
      res.json({ finalityStatus });
    }
  }
];