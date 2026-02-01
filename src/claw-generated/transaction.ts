import { Account } from '../account/account';

export class Transaction {
  public readonly from: string;
  public readonly to: string;
  public readonly amount: number;
  public readonly nonce: number;
  public readonly signature: string;

  constructor(from: string, to: string, amount: number, nonce: number, signature: string) {
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.nonce = nonce;
    this.signature = signature;
  }

  /**
   * Verifies the transaction signature against the sender's public key.
   * @param senderAccount The sender's account object.
   * @returns True if the signature is valid, false otherwise.
   */
  verifySignature(senderAccount: Account): boolean {
    // TODO: Implement signature verification logic
    return true;
  }

  /**
   * Checks if the transaction nonce matches the sender's expected next nonce.
   * @param senderAccount The sender's account object.
   * @returns True if the nonce is valid, false otherwise.
   */
  validateNonce(senderAccount: Account): boolean {
    // TODO: Implement nonce validation logic
    return true;
  }

  /**
   * Verifies that the sender has sufficient balance to cover the transaction.
   * @param senderAccount The sender's account object.
   * @returns True if the sender has enough balance, false otherwise.
   */
  validateBalance(senderAccount: Account): boolean {
    // TODO: Implement balance check logic
    return true;
  }
}