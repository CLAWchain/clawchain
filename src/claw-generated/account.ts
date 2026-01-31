export class Account {
  public readonly address: string;
  public balance: number;
  public nonce: number;

  constructor(address: string, balance: number) {
    this.address = address;
    this.balance = balance;
    this.nonce = 0;
  }

  incrementNonce(): void {
    this.nonce++;
  }
}