import { TransactionReceipt } from "./TransactionReceipt";

export class Transaction {
  sender: string;
  recipient: string;
  amount: number;
  nonce: number;

  constructor(sender: string, recipient: string, amount: number, nonce: number) {
    this.sender = sender;
    this.recipient = recipient;
    this.amount = amount;
    this.nonce = nonce;
  }

  execute(): TransactionReceipt {
    // Perform transaction logic
    const gasUsed = 21000; // Placeholder for now
    const logs = []; // Placeholder for now
    const bloomFilter = {}; // Placeholder for now

    const status = true; // Placeholder for now

    return new TransactionReceipt(status, gasUsed, logs, bloomFilter);
  }
}