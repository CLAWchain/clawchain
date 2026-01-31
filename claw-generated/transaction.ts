import { Block } from '../block/block';
import { Account } from '../account/account';

export class Transaction {
  sender: Account;
  recipient: Account;
  amount: number;
  fee: number;
  data: any;

  constructor(sender: Account, recipient: Account, amount: number, data?: any) {
    this.sender = sender;
    this.recipient = recipient;
    this.amount = amount;
    this.data = data || {};
    this.fee = this.calculateFee();
  }

  calculateFee(): number {
    // Calculate fee based on transaction size and complexity
    const baseFee = 0.01;
    const sizeMultiplier = this.data ? this.data.length / 1024 : 0;
    const complexityMultiplier = this.data ? Object.keys(this.data).length : 0;
    return baseFee + (sizeMultiplier * baseFee) + (complexityMultiplier * baseFee);
  }

  execute(block: Block): boolean {
    // TODO: Implement transaction execution logic
    return true;
  }
}