export class Transaction {
  readonly hash: string;
  readonly from: string;
  readonly to: string;
  readonly value: BigInt;
  readonly gas: number;
  readonly gasPrice: BigInt;
  readonly data: string;
  readonly nonce: number;

  constructor(
    hash: string,
    from: string,
    to: string,
    value: BigInt,
    gas: number,
    gasPrice: BigInt,
    data: string,
    nonce: number
  ) {
    this.hash = hash;
    this.from = from;
    this.to = to;
    this.value = value;
    this.gas = gas;
    this.gasPrice = gasPrice;
    this.data = data;
    this.nonce = nonce;
  }
}