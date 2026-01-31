import { PublicKey, Signature, verifySignature } from './crypto';
import { MultisigWallet } from './multisig_wallet';
import { StateChannelUpdate, StateChannel } from './state-channel';

export interface Transaction {
  from: PublicKey;
  to: PublicKey;
  value: number;
  data?: string | StateChannelUpdate;
  nonce: number;
  signatures: Signature[];
  multisigWallet?: MultisigWallet;
}

export class TransactionManager {
  private transactions: Transaction[] = [];
  private stateChannelManager: StateChannelManager;

  constructor(stateChannelManager: StateChannelManager) {
    this.stateChannelManager = stateChannelManager;
  }

  addTransaction(transaction: Transaction): void {
    if (typeof transaction.data === 'object' && 'channelId' in transaction.data) {
      // Handle state channel update
      const update = transaction.data as StateChannelUpdate;
      if (this.stateChannelManager.handleStateUpdate(update)) {
        this.transactions.push(transaction);
      }
    } else {
      // Handle regular transaction
      this.transactions.push(transaction);
    }
  }

  getTransactions(): Transaction[] {
    return this.transactions;
  }

  verifyTransaction(transaction: Transaction): boolean {
    if (typeof transaction.data === 'object' && 'channelId' in transaction.data) {
      // Verify state channel update
      const update = transaction.data as StateChannelUpdate;
      const channel = this.stateChannelManager.getChannel(update.channelId);
      if (channel) {
        return channel.applyUpdate(update);
      }
      return false;
    } else {
      // Verify regular transaction
      if (transaction.multisigWallet) {
        const { owners, threshold } = transaction.multisigWallet;
        let validSignatures = 0;

        for (const signature of transaction.signatures) {
          for (const owner of owners) {
            if (verifySignature(signature, transaction, owner)) {
              validSignatures++;
              break;
            }
          }
        }

        return validSignatures >= threshold;
      } else {
        return verifySignature(transaction.signatures[0], transaction, transaction.from);
      }
    }
  }
}