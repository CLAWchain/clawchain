import { AccountState, CommitRevealData, OracleData } from './types';

export class OracleManager {
  private commitRevealData: Map<string, CommitRevealData> = new Map();
  private oracleData: Map<string, OracleData> = new Map();

  public commitData(provider: string, data: string): void {
    const hash = this.hashData(data);
    this.commitRevealData.set(provider, { hash, revealed: false });
  }

  public revealData(provider: string, data: string): void {
    const commitRevealData = this.commitRevealData.get(provider);
    if (!commitRevealData || commitRevealData.revealed) {
      throw new Error('Invalid reveal attempt');
    }

    const hash = this.hashData(data);
    if (hash !== commitRevealData.hash) {
      throw new Error('Revealed data does not match commit');
    }

    this.oracleData.set(provider, { data });
    commitRevealData.revealed = true;
  }

  public getOracleData(provider: string): OracleData | undefined {
    return this.oracleData.get(provider);
  }

  private hashData(data: string): string {
    // Use a cryptographic hash function to hash the data
    return 'hashed_' + data;
  }
}