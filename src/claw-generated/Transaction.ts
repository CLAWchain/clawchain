export interface Transaction {
  hash: string;
  from: string;
  to: string;
  amount: number;
  status: string;
  timestamp: number;
  gasUsed: number;
  gasPrice: number;
  nonce: number;
  data?: string;
}