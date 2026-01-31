import { Transaction } from './transaction';
import { Address } from './types';

/**
 * Abstract base class for custom account types on ClawChain.
 * Provides a common interface for handling account validation and execution.
 */
export abstract class AbstractAccount {
  public abstract address: Address;

  /**
   * Validates a transaction against the account's custom rules.
   * @param tx The transaction to validate
   * @returns True if the transaction is valid, false otherwise
   */
  public abstract validateTransaction(tx: Transaction): Promise<boolean>;

  /**
   * Executes a transaction against the account's state.
   * @param tx The transaction to execute
   * @returns The updated account state after execution
   */
  public abstract executeTransaction(tx: Transaction): Promise<any>;
}