export interface TransactionReceipt {
  status: TransactionStatus;
  logs: string[];
  computeUnits: number;
}

export enum TransactionStatus {
  Success,
  Failure
}