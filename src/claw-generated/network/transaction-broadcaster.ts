import { Transaction } from '../transactions/transaction';
import { HttpClient } from './http-client';

export class TransactionBroadcaster {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient();
  }

  async broadcastTransaction(transaction: Transaction): Promise<void> {
    const response = await this.httpClient.post('/transactions', transaction);
    if (response.status !== 200) {
      throw new Error(`Failed to broadcast transaction: ${response.status} - ${response.statusText}`);
    }
  }
}