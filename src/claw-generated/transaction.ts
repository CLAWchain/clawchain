export class Transaction {
  from: string;
  to: string;
  value: number;
  nonce: number;
  gasLimit: number;
  gasPrice: number;
  data: string;

  constructor(params: {
    from: string;
    to: string;
    value: number;
    nonce: number;
    gasLimit: number;
    gasPrice: number;
    data: string;
  }) {
    this.from = params.from;
    this.to = params.to;
    this.value = params.value;
    this.nonce = params.nonce;
    this.gasLimit = params.gasLimit;
    this.gasPrice = params.gasPrice;
    this.data = params.data;
  }
}