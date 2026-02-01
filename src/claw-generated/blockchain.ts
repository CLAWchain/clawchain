import { Buffer } from 'buffer';
import { randomBytes } from 'crypto';
import nacl from 'tweetnacl';
import { Wallet } from './wallet';
import { Transaction, TransactionInput, TransactionOutput } from './transaction';

class Block {
  hash: string;
  previousHash: string;
  timestamp: number;
  transactions: Transaction[];
  finality: number;

  constructor(
    previousHash: string,
    transactions: Transaction[],
    timestamp: number = Date.now()
  ) {
    this.previousHash = previousHash;
    this.transactions = transactions;
    this.timestamp = timestamp;
    this.finality = 0;
    this.hash = this.calculateHash();
  }

  calculateHash(): string {
    const data = this.previousHash + this.timestamp + JSON.stringify(this.transactions);
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  incrementFinality(): void {
    this.finality++;
  }
}

class Blockchain {
  private chain: Block[] = [];
  private mempool: Transaction[] = [];
  private wallets: { [key: string]: Wallet } = {};

  constructor() {
    // Create the genesis block
    this.chain.push(new Block('0', []));
  }

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
    const transactions: Transaction[] = [];
    for (const tx of this.mempool) {
      const senderWallet = this.wallets[tx.from];
      if (senderWallet && this.verifyTransaction(tx, senderWallet) && tx.nonce === senderWallet.getNonce()) {
        transactions.push(tx);
      } else {
        // Discard invalid transactions
      }
    }

    // Create the new block
    const previousBlock = this.chain[this.chain.length - 1];
    const newBlock = new Block(previousBlock.hash, transactions);

    // Add the new block to the chain
    this.chain.push(newBlock);

    // Increment the finality of the previous block
    previousBlock.incrementFinality();

    // Clear the mempool
    this.mempool = [];
  }

  getBlockFinality(blockHash: string): number {
    const block = this.chain.find((b) => b.hash === blockHash);
    return block ? block.finality : 0;
  }
}

export default Blockchain;