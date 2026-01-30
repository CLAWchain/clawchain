import { Transaction, generateHash } from './Block';
import { db } from '../database/db';

export class TransactionPool {
  private pendingTransactions: Map<string, Transaction> = new Map();

  async initialize() {
    const result = await db.query(`
      SELECT * FROM transactions WHERE status = 'pending' ORDER BY gas_price DESC
    `);
    
    for (const row of result.rows) {
      const tx: Transaction = {
        hash: row.hash,
        from: row.from_address,
        to: row.to_address,
        value: BigInt(row.value),
        gasPrice: BigInt(row.gas_price),
        gasLimit: BigInt(row.gas_limit),
        nonce: row.nonce,
        data: row.data,
        signature: row.signature
      };
      this.pendingTransactions.set(tx.hash, tx);
    }
    
    console.log(`[POOL] Transaction pool initialized with ${this.pendingTransactions.size} pending transactions`);
  }

  async addTransaction(tx: Transaction): Promise<boolean> {
    if (!this.validateTransaction(tx)) {
      return false;
    }
    
    this.pendingTransactions.set(tx.hash, tx);
    
    await db.query(`
      INSERT INTO transactions (
        hash, from_address, to_address, value, gas_price, gas_limit,
        nonce, data, signature, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
      ON CONFLICT (hash) DO NOTHING
    `, [
      tx.hash, tx.from, tx.to, tx.value.toString(),
      tx.gasPrice.toString(), tx.gasLimit.toString(),
      tx.nonce, tx.data || null, tx.signature
    ]);
    
    console.log(`[POOL] Transaction ${tx.hash.substring(0, 20)}... added to pool`);
    
    return true;
  }

  async getPendingTransactions(limit: number = 100): Promise<Transaction[]> {
    const sorted = Array.from(this.pendingTransactions.values())
      .sort((a, b) => Number(b.gasPrice - a.gasPrice))
      .slice(0, limit);
    
    return sorted;
  }

  async removeTransactions(hashes: string[]) {
    for (const hash of hashes) {
      this.pendingTransactions.delete(hash);
    }
    
    if (hashes.length > 0) {
      await db.query(`
        UPDATE transactions
        SET status = 'confirmed'
        WHERE hash = ANY($1)
      `, [hashes]);
    }
  }

  private validateTransaction(tx: Transaction): boolean {
    if (!tx.hash || !tx.from || !tx.to) return false;
    if (tx.value < 0n) return false;
    if (tx.gasPrice < 0n || tx.gasLimit < 0n) return false;
    
    const calculatedHash = this.calculateTxHash(tx);
    if (tx.hash !== calculatedHash) return false;
    
    return true;
  }

  private calculateTxHash(tx: Transaction): string {
    const data = JSON.stringify({
      from: tx.from,
      to: tx.to,
      value: tx.value.toString(),
      gasPrice: tx.gasPrice.toString(),
      gasLimit: tx.gasLimit.toString(),
      nonce: tx.nonce,
      data: tx.data
    });
    
    return generateHash(data);
  }

  getPendingCount(): number {
    return this.pendingTransactions.size;
  }
}
