import { Bloom } from '../bloom-filter';

export class TransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  contractAddress: string | null;
  status: boolean;
  gasUsed: number;
  logs: any[];
  logsBloom: Bloom;

  constructor(
    transactionHash: string,
    blockNumber: number,
    blockHash: string,
    contractAddress: string | null,
    status: boolean,
    gasUsed: number,
    logs: any[],
    logsBloom: Bloom
  ) {
    this.transactionHash = transactionHash;
    this.blockNumber = blockNumber;
    this.blockHash = blockHash;
    this.contractAddress = contractAddress;
    this.status = status;
    this.gasUsed = gasUsed;
    this.logs = logs;
    this.logsBloom = logsBloom;
  }
}