import { PublicKey } from '../crypto';

export interface MultisigWallet {
  owners: PublicKey[];
  threshold: number;
}

export class MultisigWalletManager {
  private wallets: Map<string, MultisigWallet> = new Map();

  createWallet(owners: PublicKey[], threshold: number): MultisigWallet {
    const wallet: MultisigWallet = { owners, threshold };
    const walletId = this.getWalletId(wallet);
    this.wallets.set(walletId, wallet);
    return wallet;
  }

  getWallet(walletId: string): MultisigWallet | undefined {
    return this.wallets.get(walletId);
  }

  private getWalletId(wallet: MultisigWallet): string {
    return wallet.owners.map(owner => owner.toString()).sort().join('-');
  }
}