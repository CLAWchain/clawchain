import { Buffer } from 'buffer';
import { randomBytes } from 'crypto';
import nacl from 'tweetnacl';
import { Wallet } from './wallet';
import { Transaction, TransactionInput, TransactionOutput } from './transaction';

class Blockchain {
  private mempool: Transaction[] = [];
  private wallets: { [key: string]: Wallet } = {};

  addTransaction(tx: Transaction): boolean {
    const senderWallet = this.wallets[tx.from];
    if (senderWallet && this.verifyTransaction(tx, senderWallet)) {
      this.mempool.push(tx);
      senderWallet.incrementNonce();
      return true;
    }
    return false;
  }

  verifyTransaction(tx: Transaction, wallet: Wallet): boolean {
    // Verify the transaction signature against the 'from' public key
    const publicKey = wallet.getPublicKey();
    const signature = Buffer.from(tx.signature, 'hex');
    const message = Buffer.from(`${tx.from}${tx.to}${tx.amount}${tx.nonce}`);
    return nacl.sign.detached.verify(message, signature, publicKey);
  }

  registerWallet(wallet: Wallet): void {
    this.wallets[wallet.getPublicKey().toString('hex')] = wallet;
  }

  mineBlock(): void {
    // Process transactions from the mempool, verifying signatures and nonces
    for (const tx of this.mempool) {
      const senderWallet = this.wallets[tx.from];
      if (senderWallet && this.verifyTransaction(tx, senderWallet) && tx.nonce === senderWallet.getNonce()) {
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