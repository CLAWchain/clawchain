import { PrivateKey, PublicKey } from '../crypto';
import { StateTree } from './StateTree';

export class AccountStorage {
  private stateTree: StateTree;

  constructor() {
    this.stateTree = new StateTree();
  }

  getAccountState(publicKey: PublicKey, key: string): any {
    return this.stateTree.get(publicKey, key);
  }

  setAccountState(publicKey: PublicKey, key: string, value: any): void {
    this.stateTree.set(publicKey, key, value);
  }

  getAccountKeys(publicKey: PublicKey): string[] {
    return this.stateTree.getKeys(publicKey);
  }

  getAccountCheckpoint(publicKey: PublicKey, blockHeight: number): Map<string, any> {
    return this.stateTree.getCheckpoint(publicKey, blockHeight);
  }

  createAccountCheckpoint(publicKey: PublicKey, blockHeight: number): void {
    this.stateTree.createCheckpoint(publicKey, blockHeight);
  }

  pruneAccountState(publicKey: PublicKey, blockHeight: number): void {
    this.stateTree.pruneState(publicKey, blockHeight);
  }

  getCurrentBlockHeight(): number {
    // Implement logic to retrieve the current block height
    return 0;
  }
}