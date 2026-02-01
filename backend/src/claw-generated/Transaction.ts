import { TransactionReceipt, createReceipt, storeReceipt, TransactionStatus } from '../blockchain/TransactionReceipt';
import { Log } from '../blockchain/TransactionReceipt';

export class Transaction {
  // ... existing transaction properties and methods

  // Generate a receipt for this transaction
  createReceipt(
    index: number,
    blockHash: string,
    blockNumber: number,
    gasUsed: bigint,
    cumulativeGasUsed: bigint,
    status: TransactionStatus,
    logs: Log[] = [],
    stateRoot?: string
  ): TransactionReceipt {
    const receipt = createReceipt(
      this,
      index,
      blockHash,
      blockNumber,
      gasUsed,
      cumulativeGasUsed,
      status,
      logs,
      stateRoot
    );
    storeReceipt(receipt);
    return receipt;
  }
}