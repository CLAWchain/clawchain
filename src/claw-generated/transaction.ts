import { Block } from '../block/block';
import { Account } from '../account/account';

export class Transaction {
  sender: Account;
  recipient: Account;
  amount: number;
  fee: number;

  constructor(sender: Account, recipient: Account, amount: number, fee: number) {
    this.sender = sender;
    this.recipient = recipient;
    this.amount = amount;
    this.fee = fee;
  }

  validate(): boolean {
    // Validate the transaction (e.g., check sender balance, signature, etc.)
    return true;
  }

  apply(block: Block): void {
    // Deduct the fee from the sender's account
    this.sender.balance -= this.amount + this.fee;

    // Add the fee to the block reward
    block.reward += this.fee;

    // Transfer the amount to the recipient
    this.recipient.balance += this.amount;
  }

  calculateFee(): number {
    // Calculate the fee based on transaction size and complexity
    const baseFee = 0.001; // 0.001 ClawCoin per byte
    const sizeInBytes = this.serialize().length;
    const complexityFactor = 1; // Placeholder, will add more logic later
    return baseFee * sizeInBytes * complexityFactor;
  }

  serialize(): string {
    // Serialize the transaction to a string
    return JSON.stringify({
      sender: this.sender.address,
      recipient: this.recipient.address,
      amount: this.amount,
      fee: this.fee
    });
  }
}