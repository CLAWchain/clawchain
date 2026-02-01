import { Buffer } from 'buffer';
import { randomBytes } from 'crypto';
import nacl from 'tweetnacl';

interface Transaction {
  from: string;
  to: string;
  amount: number;
  signature: string;
}

class Blockchain {
  private mempool: Transaction[] = [];

  addTransaction(tx: Transaction): boolean {
    if (this.verifyTransaction(tx)) {
      this.mempool.push(tx);
      return true;
    }
    return false;
  }

  verifyTransaction(tx: Transaction): boolean {
    // Verify the transaction signature against the 'from' public key
    const publicKey = Buffer.from(tx.from, 'hex');
    const signature = Buffer.from(tx.signature, 'hex');
    const message = Buffer.from(`${tx.from}${tx.to}${tx.amount}`);
    return nacl.sign.detached.verify(message, signature, publicKey);
  }

  mineBlock(): void {
    // Process transactions from the mempool, verifying signatures
    for (const tx of this.mempool) {
      if (this.verifyTransaction(tx)) {
        // Add the verified transaction to the block
      } else {
        // Discard invalid transactions
      }
    }
    // Clear the mempool
    this.mempool = [];
    // Add the new block to the chain
  }
}

export default Blockchain;