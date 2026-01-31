import { Transaction } from './Transaction';
import { TransactionService } from './TransactionService';
import { ParallelTransactionVerifierWorker } from './ParallelTransactionVerifierWorker';

export class ParallelTransactionVerifier {
  private readonly transactionService: TransactionService;
  private readonly workers: ParallelTransactionVerifierWorker[];
  private readonly maxWorkers: number;

  constructor(transactionService: TransactionService, maxWorkers: number = 4) {
    this.transactionService = transactionService;
    this.maxWorkers = maxWorkers;
    this.workers = Array.from({ length: maxWorkers }, () => new ParallelTransactionVerifierWorker(transactionService));
  }

  public async verifyTransactions(transactions: Transaction[]): Promise<boolean[]> {
    const verificationTasks = transactions.map((tx) => this.workers[this.getWorkerIndex()].verifyTransaction(tx));
    const results = await Promise.all(verificationTasks);
    return results;
  }

  private getWorkerIndex(): number {
    return Math.floor(Math.random() * this.maxWorkers);
  }
}