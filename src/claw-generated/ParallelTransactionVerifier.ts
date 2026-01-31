import { Block, Transaction } from './Block';
import { Crypto } from './Crypto';

export class ParallelTransactionVerifier {
  private workerPool: Worker[];
  private taskQueue: VerificationTask[];
  private completedTasks: number;

  constructor(numWorkers: number) {
    this.workerPool = Array.from({ length: numWorkers }, () => new Worker('./ParallelTransactionVerifierWorker.js'));
    this.taskQueue = [];
    this.completedTasks = 0;
  }

  async verifyTransactions(block: Block): Promise<boolean> {
    this.taskQueue = block.transactions.map(tx => ({
      transaction: tx,
      valid: false
    }));

    this.completedTasks = 0;

    for (const worker of this.workerPool) {
      this.assignTaskToWorker(worker);
    }

    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (this.completedTasks === this.taskQueue.length) {
          clearInterval(interval);

          // Check if all transactions are valid
          const allValid = this.taskQueue.every(task => task.valid);
          resolve(allValid);
        }
      }, 100);
    });
  }

  private assignTaskToWorker(worker: Worker) {
    if (this.taskQueue.length === 0) return;

    const task = this.taskQueue.shift()!;
    worker.postMessage(task.transaction);

    worker.onmessage = (event) => {
      task.valid = event.data;
      this.completedTasks++;
      this.assignTaskToWorker(worker);
    };
  }
}

interface VerificationTask {
  transaction: Transaction;
  valid: boolean;
}