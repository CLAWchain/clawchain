import level from 'level';

const db = level('./chaindb');

export async function getTransaction(signature: string): Promise<Transaction | null> {
  try {
    const txData = await db.get(signature);
    return JSON.parse(txData) as Transaction;
  } catch (err) {
    if (err.type === 'NotFoundError') {
      return null;
    }
    throw err;
  }
}

export async function storeTransaction(transaction: Transaction): Promise<void> {
  await db.put(transaction.signature, JSON.stringify(transaction));
}

export async function getBlock(slot: number): Promise<Block | null> {
  try {
    const blockData = await db.get(`block-${slot}`);
    return JSON.parse(blockData) as Block;
  } catch (err) {
    if (err.type === 'NotFoundError') {
      return null;
    }
    throw err;
  }
}

export async function storeBlock(block: Block): Promise<void> {
  await db.put(`block-${block.slot}`, JSON.stringify(block));
}