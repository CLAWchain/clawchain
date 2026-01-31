export class TransactionReceipt {
  readonly transactionHash: string;
  readonly transactionIndex: number;
  readonly blockHash: string;
  readonly blockNumber: number;
  readonly from: string;
  readonly to: string;
  readonly contractAddress: string | null;
  readonly cumulativeGasUsed: number;
  readonly gasUsed: number;
  readonly logs: LogEntry[];
  readonly logsBloom: string;
  readonly status: number;

  constructor(
    transactionHash: string,
    transactionIndex: number,
    blockHash: string,
    blockNumber: number,
    from: string,
    to: string,
    contractAddress: string | null,
    cumulativeGasUsed: number,
    gasUsed: number,
    logs: LogEntry[],
    logsBloom: string,
    status: number
  ) {
    this.transactionHash = transactionHash;
    this.transactionIndex = transactionIndex;
    this.blockHash = blockHash;
    this.blockNumber = blockNumber;
    this.from = from;
    this.to = to;
    this.contractAddress = contractAddress;
    this.cumulativeGasUsed = cumulativeGasUsed;
    this.gasUsed = gasUsed;
    this.logs = logs;
    this.logsBloom = logsBloom;
    this.status = status;
  }
}

export interface LogEntry {
  address: string;
  topics: string[];
  data: string;
}