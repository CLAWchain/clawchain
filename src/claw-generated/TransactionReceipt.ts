export class TransactionReceipt {
  status: boolean;
  gasUsed: number;
  logs: any[];
  bloomFilter: any;

  constructor(status: boolean, gasUsed: number, logs: any[], bloomFilter: any) {
    this.status = status;
    this.gasUsed = gasUsed;
    this.logs = logs;
    this.bloomFilter = bloomFilter;
  }
}