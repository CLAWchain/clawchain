import { JsonRpcRequest, JsonRpcResponse, JsonRpcError } from './types';
import { TransactionProcessor } from '../transaction/transaction-validation';
import { Transaction } from '../transaction/transaction';

class SendTransactionHandler {
  private transactionProcessor: TransactionProcessor;

  constructor(transactionProcessor: TransactionProcessor) {
    this.transactionProcessor = transactionProcessor;
  }

  async handle(params: { signedTransaction: string }): Promise<JsonRpcResponse> {
    const { signedTransaction } = params;

    try {
      // Decode the base64-encoded transaction
      const transaction = Transaction.fromBase64(signedTransaction);

      // Validate the transaction
      await this.transactionProcessor.validateTransaction(transaction);

      // Add the transaction to the pool and broadcast it
      await this.transactionProcessor.processTransaction(transaction);

      // Return the transaction hash
      return {
        result: transaction.hash.toString('hex')
      };
    } catch (error) {
      return {
        error: {
          code: JsonRpcError.InternalError,
          message: error.message
        }
      };
    }
  }
}

export default SendTransactionHandler;