import { Transaction } from '../transaction/transaction';
import { getVerifiableRandomness } from '../crypto/verifiable-randomness';

export class Block {
  transactions: Transaction[];
  reward: number;

  constructor(transactions: Transaction[]) {
    // Shuffle the transactions using verifiable randomness
    const shufflingSeed = getVerifiableRandomness();
    this.transactions = this.shuffleTransactions(transactions, shufflingSeed);
    this.reward = this.calculateReward();
  }

  private shuffleTransactions(transactions: Transaction[], seed: Uint8Array): Transaction[] {
    // Use Fisher-Yates shuffle algorithm with the verifiable seed
    const shuffledTransactions = [...transactions];
    for (let i = shuffledTransactions.length - 1; i > 0; i--) {
      const j = Math.floor(this.hash(seed, i) % (i + 1));
      [shuffledTransactions[i], shuffledTransactions[j]] = [shuffledTransactions[j], shuffledTransactions[i]];
    }
    return shuffledTransactions;
  }

  private hash(data: Uint8Array, index: number): number {
    // Hash the seed and index to get a deterministic, verifiable random number
    const hashInput = new Uint8Array([...data, index]);
    return parseInt(this.sha256(hashInput).slice(0, 8), 16);
  }

  private sha256(data: Uint8Array): string {
    // Implement SHA-256 hash function
    // ...
  }

  private calculateReward(): number {
    let totalFees = 0;
    for (const tx of this.transactions) {
      totalFees += tx.fee;
    }
    return 10 + totalFees;
  }
}