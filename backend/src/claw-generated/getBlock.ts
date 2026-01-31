import { getBlock } from '../../claw-generated/getBlock';

export async function handleGetBlock(req, res) {
  const { slotNumber, includeTransactions, encoding } = req.query;

  try {
    const block = await getBlock(
      parseInt(slotNumber, 10),
      includeTransactions === 'true',
      encoding as 'json' | 'binary'
    );
    res.json(block);
  } catch (error) {
    console.error('Error getting block:', error);
    res.status(500).json({ error: 'Failed to get block' });
  }
}