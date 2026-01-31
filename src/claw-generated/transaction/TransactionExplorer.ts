import { TransactionRequest, TransactionResponse } from '@ethersproject/providers';
import { Transaction } from './Transaction';

export class TransactionExplorer extends Transaction {
  public sender: string;
  public receiver: string;
  public amount: number;
  public status: 'pending' | 'confirmed' | 'failed';

  constructor(tx: TransactionRequest) {
    super();
    this.sender = tx.from;
    this.receiver = tx.to;
    this.amount = tx.value;
    this.status = 'pending';
  }

  public async confirm(txResponse: TransactionResponse) {
    this.status = 'confirmed';
    // Add any other confirmation logic here
  }

  public fail(error: Error) {
    this.status = 'failed';
    // Add any other failure logic here
  }
}