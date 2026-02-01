import { AccountState } from './transaction/transaction';

export class AccountStateManager {
  private accountStates: Map<string, AccountState> = new Map();

  getAccountState(address: Uint8Array): AccountState {
    const addressHex = Buffer.from(address).toString('hex');
    if (this.accountStates.has(addressHex)) {
      return this.accountStates.get(addressHex)!;
    }
    const newState = new AccountState(address, 0);
    this.accountStates.set(addressHex, newState);
    return newState;
  }

  updateNonce(address: Uint8Array, nonce: number): void {
    const addressHex = Buffer.from(address).toString('hex');
    if (this.accountStates.has(addressHex)) {
      this.accountStates.get(addressHex)!.nonce = nonce;
    } else {
      this.accountStates.set(addressHex, new AccountState(address, nonce));
    }
  }
}