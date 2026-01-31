import { Transaction } from './transaction';
import { Account } from '../account/account';
import { BloomFilter } from '../bloom-filter';
import { Log, TransactionReceipt, TransactionReceiptManager } from './TransactionReceipt';

export class TransactionReceiptGenerator {
  static generateReceipt(
    transaction: Transaction,
    blockHash: string,
    blockNumber: number,
    status: 'success' | 'failure',
    gasUsed: number,
    cumulativeGasUsed: number,
    logs: Log[],
    contractAddress: string | null
  ): TransactionReceipt {
    return TransactionReceiptManager.generateReceipt(
      transaction,
      blockHash,
      blockNumber,
      status,
      gasUsed,
      cumulativeGasUsed,
      logs,
      contractAddress
    );
  }
}