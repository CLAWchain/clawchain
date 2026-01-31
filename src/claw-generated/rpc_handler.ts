import { Transaction } from '../types/transaction';
import { TransactionStorage } from '../storage/transaction_storage';

export class RPCHandler {
  private transactionStorage: TransactionStorage;

  constructor(transactionStorage: TransactionStorage) {
    this.transactionStorage = transactionStorage;
  }

  async getSignaturesForAddress(
    address: string,
    limit: number,
    offset: number
  ): Promise<{ signatures: string[], hasMore: boolean }> {
    const signatures = await this.transactionStorage.getSignaturesForAddress(
      address,
      limit,
      offset
    );
    const hasMore = signatures.length === limit;
    return { signatures, hasMore };
  }
}