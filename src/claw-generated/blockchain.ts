import { Buffer } from 'buffer';
import { randomBytes } from 'crypto';
import nacl from 'tweetnacl';
import { Wallet } from './wallet';
import { Transaction, TransactionInput, TransactionOutput } from './transaction';
import { Account } from './account';
import { MerklePatriciaTrie } from '../trie/trie';

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
  private accountTrie: MerklePatriciaTrie;
  private wallets: { [key: string]: Wallet } = {};

  constructor() {
    // Create the genesis block
    this.chain.push(new Block('0', []));
    this.accountTrie = new MerklePatriciaTrie();
  }

  addTransaction(tx: Transaction): boolean {
    const senderAccount = this.getAccount(tx.from);
    if (senderAccount && this.verifyTransaction(tx, senderAccount)) {
      this.mempool.push(tx);
      senderAccount.incrementNonce();
      return true;
    }
    return false;
  }

  verifyTransaction(tx: Transaction, account: Account): boolean {
    // Verify the transaction signature against the 'from' public key
    const publicKey = Buffer.from(account.address, 'hex');
    const signature = Buffer.from(tx.signature, 'hex');
    const message = Buffer.from(`${tx.from}${tx.to}${tx.amount}${tx.nonce}`);
    return nacl.sign.detached.verify(message, signature, publicKey);
  }

  registerWallet(wallet: Wallet): void {
    this.wallets[wallet.getPublicKey().toString('hex')] = wallet;
    this.createAccount(wallet.getPublicKey().toString('hex'), 0);
  }

  createAccount(address: string, initialBalance: number): void {
    const account = new Account(address, initialBalance);
    this.accountTrie.set(address, JSON.stringify(account));
  }

  getAccount(address: string): Account | undefined {
    const accountData = this.accountTrie.get(address);
    return accountData ? JSON.parse(accountData) : undefined;
  }

  mineBlock(): void {
    // Process transactions from the mempool, verifying signatures and nonces
    const transactions: Transaction[] = [];
    for (const tx of this.mempool) {
      const senderAccount = this.getAccount(tx.from);
      if (senderAccount && this.verifyTransaction(tx, senderAccount) && tx.nonce === senderAccount.nonce) {
        transactions.push(tx);
        senderAccount.addTransaction(tx);
        this.updateAccount(senderAccount);
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

  private updateAccount(account: Account): void {
    this.accountTrie.set(account.address, JSON.stringify(account));
  }
}

export default Blockchain;