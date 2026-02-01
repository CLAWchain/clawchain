import { Transaction } from './Transaction';
import { TransactionReceipt, getBlockReceipts, calculateReceiptsRoot } from '../blockchain/TransactionReceipt';

export class Block {
  // ... existing block properties and methods

  processTransactions(): void {
    // ... existing transaction processing logic

    // Generate receipts for each transaction
    this.transactions.forEach((tx, index) => {
      const receipt = tx.createReceipt(
        index,
        this.hash,
        this.number,
        this.gasUsed,
        this.cumulativeGasUsed,
        // TODO: Determine actual transaction status
        TransactionStatus.SUCCESS,
        [] // TODO: Populate logs
      );
      this.receipts.push(receipt);
    });

    // Calculate and store the receipts Merkle root
    this.receiptsRoot = calculateReceiptsRoot(this.receipts);
  }

  get receipts(): TransactionReceipt[] {
    return getBlockReceipts(this.number);
  }
}