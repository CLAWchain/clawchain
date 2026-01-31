import { TransactionRequest, TransactionResponse } from '@ethersproject/providers';
import { keccak256 } from '@ethersproject/keccak256';
import { getTransactionNonce, isValidGasLimit } from './utils';
import { Provider } from '@ethersproject/providers';

export class Transaction {
  private static provider: Provider;

  public static setProvider(p: Provider) {
    this.provider = p;
  }

  public static async validate(tx: TransactionRequest): Promise<void> {
    // Check the transaction nonce
    const expectedNonce = await getTransactionNonce(tx.from);
    if (tx.nonce !== expectedNonce) {
      throw new Error(`Invalid transaction nonce. Expected ${expectedNonce}, got ${tx.nonce}`);
    }

    // Check the gas limit
    if (!isValidGasLimit(tx.gasLimit)) {
      throw new Error(`Invalid gas limit: ${tx.gasLimit}`);
    }

    // Add any other validation checks here
  }

  public static async broadcast(tx: TransactionRequest): Promise<string> {
    // Submit the transaction to the network
    const txResponse: TransactionResponse = await this.provider.sendTransaction(tx);
    return txResponse.hash;
  }
}