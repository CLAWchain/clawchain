export interface Transaction {
  from: string;
  to: string;
  amount: number;
  nonce: number;
  signature: string;
}