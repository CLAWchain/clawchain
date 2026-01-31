export class Account {
  address: string;
  balance: number;
  nonce: number;

  constructor(address: string, balance: number, nonce: number) {
    this.address = address;
    this.balance = balance;
    this.nonce = nonce;
  }

  // Add methods for updating balance, nonce, etc.
}