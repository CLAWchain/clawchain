import { Address, Transaction } from './types';

/**
 * Base class for custom account types on ClawChain.
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

  /**
   * Registers a custom account validation method.
   * @param validationMethod The validation method to register
   */
  public registerValidationMethod(validationMethod: (tx: Transaction) => Promise<boolean>): void {
    this.validateTransaction = validationMethod;
  }

  /**
   * Registers a custom account execution method.
   * @param executionMethod The execution method to register
   */
  public registerExecutionMethod(executionMethod: (tx: Transaction) => Promise<any>): void {
    this.executeTransaction = executionMethod;
  }
}

/**
 * Simple account type with basic validation and execution logic.
 */
export class SimpleAccount extends AbstractAccount {
  public address: Address;
  private balance: number;

  constructor(address: Address, balance: number) {
    super();
    this.address = address;
    this.balance = balance;
  }

  public async validateTransaction(tx: Transaction): Promise<boolean> {
    return tx.from === this.address && tx.value <= this.balance;
  }

  public async executeTransaction(tx: Transaction): Promise<any> {
    this.balance -= tx.value;
    return { balance: this.balance };
  }
}

/**
 * Multisig account type with custom validation and execution logic.
 */
export class MultisigAccount extends AbstractAccount {
  public address: Address;
  private owners: Address[];
  private requiredSignatures: number;
  private balance: number;

  constructor(address: Address, owners: Address[], requiredSignatures: number, balance: number) {
    super();
    this.address = address;
    this.owners = owners;
    this.requiredSignatures = requiredSignatures;
    this.balance = balance;
  }

  public async validateTransaction(tx: Transaction): Promise<boolean> {
    const validSignatures = tx.signatures.filter(sig => this.owners.includes(sig.signer));
    return validSignatures.length >= this.requiredSignatures && tx.value <= this.balance;
  }

  public async executeTransaction(tx: Transaction): Promise<any> {
    this.balance -= tx.value;
    return { balance: this.balance };
  }
}

/**
 * Smart contract account type with custom validation and execution logic.
 */
export class SmartContractAccount extends AbstractAccount {
  public address: Address;
  private code: string;
  private balance: number;

  constructor(address: Address, code: string, balance: number) {
    super();
    this.address = address;
    this.code = code;
    this.balance = balance;
  }

  public async validateTransaction(tx: Transaction): Promise<boolean> {
    // Validate transaction against smart contract logic
    return true;
  }

  public async executeTransaction(tx: Transaction): Promise<any> {
    // Execute transaction against smart contract code
    this.balance -= tx.value;
    return { balance: this.balance };
  }
}

/**
 * Factory for creating custom account types.
 */
export class AccountFactory {
  public static createAccount(type: 'simple' | 'multisig' | 'smartContract', ...args: any[]): AbstractAccount {
    switch (type) {
      case 'simple':
        return new SimpleAccount(...args);
      case 'multisig':
        return new MultisigAccount(...args);
      case 'smartContract':
        return new SmartContractAccount(...args);
      default:
        throw new Error('Invalid account type');
    }
  }
}