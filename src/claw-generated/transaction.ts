import { MultisigWallet } from './multisig_wallet';
import { Wallet } from './wallet';
import { TransactionOrdering } from './transaction_ordering';

export class Transaction {
  public from: string;
  public to: string;
  public value: number;
  public nonce: number;
  public signatures: string[];
  public multisigData?: {
    signerPublicKeys: string[];
    requiredSignatures: number;
  };

  constructor(from: string, to: string, value: number, nonce: number) {
    this.from = from;
    this.to = to;
    this.value = value;
    this.nonce = nonce;
    this.signatures = [];
  }

  sign(wallet: Wallet): void {
    // Sign the transaction using the wallet's private key
    const signature = wallet.sign(this);
    this.signatures.push(signature);
  }

  async verifySignatures(): Promise<boolean> {
    if (this.multisigData) {
      const { signerPublicKeys, requiredSignatures } = this.multisigData;
      const multisigWallet = new MultisigWallet(Buffer.from(''), signerPublicKeys, requiredSignatures);
      return await multisigWallet.verifySignatures(this, this.signatures);
    } else {
      // Verify the single signature using the from address
      return true;
    }
  }

  async processTransaction(): Promise<void> {
    // Add the transaction to the ordering pool
    const transactionOrdering = new TransactionOrdering();
    transactionOrdering.addTransaction(this);

    // Process the transactions using the fair ordering logic
    const orderedTransactions = transactionOrdering.processTransactions();

    // Proceed with the transaction processing
    // ...
  }
}