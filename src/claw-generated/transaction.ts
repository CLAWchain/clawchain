import { FeeCalculator } from './fee-calculator';

export class Transaction {
  public id: string;
  public from: string;
  public to: string;
  public amount: number;
  public fee: number;
  public timestamp: number;
  public signature: string;

  constructor(
    id: string,
    from: string,
    to: string,
    amount: number,
    timestamp: number,
    signature: string
  ) {
    this.id = id;
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.fee = FeeCalculator.calculateFee(this);
    this.timestamp = timestamp;
    this.signature = signature;
  }
}