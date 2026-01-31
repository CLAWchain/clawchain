import { Account } from "./account";
import { TransactionSignature } from "./crypto/transaction-signer";

export enum TransactionStatus {
  Pending = "pending",
  Confirmed = "confirmed",
  Failed = "failed",
}

export class Transaction {
  from: Account;
  to: Account;
  amount: number;
  nonce: number;
  signature: TransactionSignature;
  contractBytecode?: string;
  status: TransactionStatus;
  timestamp: number;
  blockNumber: number;

  constructor(
    from: Account,
    to: Account,
    amount: number,
    nonce: number,
    signature: TransactionSignature,
    contractBytecode?: string,
    status: TransactionStatus = TransactionStatus.Pending,
    timestamp: number = Date.now(),
    blockNumber: number = 0
  ) {
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.nonce = nonce;
    this.signature = signature;
    this.contractBytecode = contractBytecode;
    this.status = status;
    this.timestamp = timestamp;
    this.blockNumber = blockNumber;
  }

  validate(): boolean {
    // Check that the nonce is greater than the current nonce for the from account
    if (this.nonce <= this.from.nonce) {
      return false;
    }

    // Check for integer overflow in amount and nonce
    if (this.amount < 0 || this.nonce < 0) {
      return false;
    }

    // Verify the transaction signature
    if (!this.signature.verify(this.from.publicKey)) {
      return false;
    }

    // Update the from account's nonce
    this.from.nonce = this.nonce;

    // Check the sender's account balance
    if (this.from.balance < this.amount) {
      return false;
    }

    // Deduct the amount from the sender's balance and add it to the recipient's balance
    this.from.balance -= this.amount;
    this.to.balance += this.amount;

    return true;
  }

  updateStatus(status: TransactionStatus, blockNumber: number = 0): void {
    this.status = status;
    this.blockNumber = blockNumber;
  }
}