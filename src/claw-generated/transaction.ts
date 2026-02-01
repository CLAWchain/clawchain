import { Wallet, SignedTransaction } from './wallet';

export class Transaction {
  private readonly version: number = 1;
  private readonly sender: Uint8Array;
  private readonly recipient: Uint8Array;
  private readonly amount: number;
  private readonly timestamp: number;

  constructor(sender: Uint8Array, recipient: Uint8Array, amount: number) {
    this.sender = sender;
    this.recipient = recipient;
    this.amount = amount;
    this.timestamp = Date.now();
  }

  serialize(): Uint8Array {
    // Serialize the transaction data into a binary format
    return new Uint8Array([
      this.version,
      ...this.sender,
      ...this.recipient,
      ...new Uint8Array(this.amount.toString().split('').map(Number)),
      ...new Uint8Array(this.timestamp.toString().split('').map(Number))
    ]);
  }

  static deserialize(data: Uint8Array): Transaction {
    // Deserialize the binary data into a Transaction object
    const version = data[0];
    const sender = data.slice(1, 33);
    const recipient = data.slice(33, 65);
    const amountStr = String.fromCharCode(...data.slice(65, 75));
    const amount = parseInt(amountStr, 10);
    const timestampStr = String.fromCharCode(...data.slice(75));
    const timestamp = parseInt(timestampStr, 10);

    return new Transaction(sender, recipient, amount);
  }

  static createSignedTransaction(wallet: Wallet, recipient: Uint8Array, amount: number): SignedTransaction {
    const transaction = new Transaction(wallet.getPublicKey(), recipient, amount);
    return wallet.signTransaction(transaction);
  }
}