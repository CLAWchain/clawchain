import { Transaction } from './transaction';
import { TransactionSigner } from './crypto/transaction-signer';

class TransactionPool {
  private transactions: Transaction[] = [];
  private peersSeen: Map<string, Set<string>> = new Map(); // peerId -> Set of transaction hashes
  private transactionSigner: TransactionSigner;

  constructor() {
    this.transactionSigner = new TransactionSigner();
  }

  addTransaction(tx: Transaction) {
    // Verify the transaction signature
    if (!this.transactionSigner.verifyTransaction(tx)) {
      throw new Error('Invalid transaction signature');
    }

    // Add the transaction to the pool
    this.transactions.push(tx);
  }

  hasPeerSeenTransaction(peerId: string, txHash: string): boolean {
    // Check if the given peer has already seen the transaction
    const peerTransactions = this.peersSeen.get(peerId);
    return peerTransactions?.has(txHash) ?? false;
  }

  markPeerAsSeenTransaction(peerId: string, txHash: string) {
    // Mark the peer as having seen the transaction
    let peerTransactions = this.peersSeen.get(peerId);
    if (!peerTransactions) {
      peerTransactions = new Set();
      this.peersSeen.set(peerId, peerTransactions);
    }
    peerTransactions.add(txHash);
  }

  getPendingTransactions(): Transaction[] {
    // Get the list of pending transactions
    return this.transactions;
  }
}

export { TransactionPool };