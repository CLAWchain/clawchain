import { Account } from './account';

export class TransactionReceipt {
  public transactionHash: string;
  public blockNumber: number;
  public from: string;
  public to: string;
  public gasUsed: number;
  public cumulativeGasUsed: number;
  public contractAddress: string | null;
  public logs: any[];
  public status: boolean;
  public account: Account;

  constructor(
    transactionHash: string,
    blockNumber: number,
    from: string,
    to: string,
    gasUsed: number,
    cumulativeGasUsed: number,
    contractAddress: string | null,
    logs: any[],
    status: boolean,
    account: Account
  ) {
    this.transactionHash = transactionHash;
    this.blockNumber = blockNumber;
    this.from = from;
    this.to = to;
    this.gasUsed = gasUsed;
    this.cumulativeGasUsed = cumulativeGasUsed;
    this.contractAddress = contractAddress;
    this.logs = logs;
    this.status = status;
    this.account = account;
  }
}