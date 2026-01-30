import { Transaction, generateHash } from './Block';
import { db } from '../database/db';
import { verifyTransactionSignature, sha256Base58 } from './Crypto';
import { stateManager } from './StateManager';
import { eventBus } from '../events/EventBus';

// Validation result with detailed error
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Gas limits
const MIN_GAS_LIMIT = 21000n;  // Minimum for basic transfer
const MAX_GAS_LIMIT = 30000000n;  // Block gas limit
const MIN_GAS_PRICE = 1n;  // Minimum gas price (lamports)

export class TransactionPool {
  private pendingTransactions: Map<string, Transaction> = new Map();
  private knownHashes: Set<string> = new Set();  // Replay protection

  async initialize() {
    try {
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
        this.knownHashes.add(tx.hash);
      }
      
      // Also load confirmed transaction hashes for replay protection
      const confirmedResult = await db.query(`
        SELECT hash FROM transactions WHERE status = 'confirmed' ORDER BY id DESC LIMIT 10000
      `);
      for (const row of confirmedResult.rows) {
        this.knownHashes.add(row.hash);
      }
      
      console.log(`[POOL] Transaction pool initialized with ${this.pendingTransactions.size} pending transactions`);
      console.log(`[POOL] Known transaction hashes: ${this.knownHashes.size}`);
    } catch (error) {
      console.error('[POOL] Initialization error:', error);
    }
  }

  async addTransaction(tx: Transaction): Promise<ValidationResult> {
    // Validate transaction
    const validation = await this.validateTransaction(tx);
    if (!validation.valid) {
      console.log(`[POOL] Transaction rejected: ${validation.error}`);
      return validation;
    }
    
    this.pendingTransactions.set(tx.hash, tx);
    this.knownHashes.add(tx.hash);
    
    try {
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
    } catch (error) {
      console.error('[POOL] Database error:', error);
    }
    
    console.log(`[POOL] Transaction ${tx.hash.substring(0, 16)}... added (${stateManager.formatBalance(tx.value)})`);
    
    // Emit event
    eventBus.emit('transaction_added', {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value.toString()
    });
    
    return { valid: true };
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
      try {
        await db.query(`
          UPDATE transactions
          SET status = 'confirmed'
          WHERE hash = ANY($1)
        `, [hashes]);
      } catch (error) {
        console.error('[POOL] Error updating transaction status:', error);
      }
    }
  }

  private async validateTransaction(tx: Transaction): Promise<ValidationResult> {
    // Basic field validation
    if (!tx.hash || !tx.from || !tx.to) {
      return { valid: false, error: 'Missing required fields' };
    }
    
    if (tx.from === tx.to) {
      return { valid: false, error: 'Cannot send to self' };
    }
    
    if (tx.value < 0n) {
      return { valid: false, error: 'Negative value' };
    }
    
    // Gas validation
    if (tx.gasLimit < MIN_GAS_LIMIT) {
      return { valid: false, error: `Gas limit too low (min: ${MIN_GAS_LIMIT})` };
    }
    
    if (tx.gasLimit > MAX_GAS_LIMIT) {
      return { valid: false, error: `Gas limit too high (max: ${MAX_GAS_LIMIT})` };
    }
    
    if (tx.gasPrice < MIN_GAS_PRICE) {
      return { valid: false, error: `Gas price too low (min: ${MIN_GAS_PRICE})` };
    }
    
    // Replay protection - check for duplicate hash
    if (this.knownHashes.has(tx.hash)) {
      return { valid: false, error: 'Transaction already known (replay)' };
    }
    
    // Verify hash integrity
    const calculatedHash = this.calculateTxHash(tx);
    if (tx.hash !== calculatedHash) {
      return { valid: false, error: 'Invalid transaction hash' };
    }
    
    // Verify signature (Ed25519)
    if (!tx.signature) {
      return { valid: false, error: 'Missing signature' };
    }
    
    const signatureValid = verifyTransactionSignature(tx);
    if (!signatureValid) {
      return { valid: false, error: 'Invalid signature' };
    }
    
    // Check sender has sufficient balance
    const senderBalance = stateManager.getBalance(tx.from);
    const totalCost = tx.value + (tx.gasPrice * tx.gasLimit);
    if (senderBalance < totalCost) {
      return { valid: false, error: `Insufficient balance: has ${senderBalance}, needs ${totalCost}` };
    }
    
    // Check nonce
    const expectedNonce = stateManager.getNonce(tx.from);
    if (tx.nonce < expectedNonce) {
      return { valid: false, error: `Nonce too low: expected ${expectedNonce}, got ${tx.nonce}` };
    }
    
    // Allow slightly higher nonce for queued transactions
    if (tx.nonce > expectedNonce + 10) {
      return { valid: false, error: `Nonce too high: expected ${expectedNonce}, got ${tx.nonce}` };
    }
    
    return { valid: true };
  }

  private calculateTxHash(tx: Transaction): string {
    const data = JSON.stringify({
      from: tx.from,
      to: tx.to,
      value: tx.value.toString(),
      gasPrice: tx.gasPrice.toString(),
      gasLimit: tx.gasLimit.toString(),
      nonce: tx.nonce,
      data: tx.data,
      signature: tx.signature
    });
    
    return sha256Base58(data);
  }

  getPendingCount(): number {
    return this.pendingTransactions.size;
  }
  
  // Get transactions for a specific address
  getPendingForAddress(address: string): Transaction[] {
    return Array.from(this.pendingTransactions.values())
      .filter(tx => tx.from === address || tx.to === address);
  }
  
  // Clear expired transactions (optional TTL)
  clearExpired(maxAge: number = 3600000): number {
    // This would require storing timestamp with each tx
    // For now, just return 0
    return 0;
  }
}
