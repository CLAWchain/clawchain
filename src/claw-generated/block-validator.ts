import { Block } from './block';
import { Transaction } from './transaction';

export class BlockValidator {
  static async validateBlock(block: Block): Promise<boolean> {
    // 1. Verify the block header
    // (Implement block header validation logic here)

    // 2. Verify the transactions in the block
    for (const tx of block.transactions) {
      if (!await TransactionProcessor.processTransaction(tx)) {
        console.error(`Invalid transaction in block: ${tx.id}`);
        return false;
      }
    }

    return true;
  }
}