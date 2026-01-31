export class Account {
  public address: string;
  public balance: number;
  public nonce: number;

  constructor(address: string, balance: number, nonce: number) {
    this.address = address;
    this.balance = balance;
    this.nonce = nonce;
  }
}