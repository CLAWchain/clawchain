import { AccountState } from './state/account_state';
import { recoverPublicKey, verifySignature } from './crypto';

class Transaction {
  public readonly from: string;
  public readonly to: string;
  public readonly value: number;
  public readonly nonce: number;
  public readonly data: Uint8Array;
  public readonly signature: Uint8Array;
  public readonly fee: number;

  constructor(from: string, to: string, value: number, nonce: number, data: Uint8Array, signature: Uint8Array, fee: number) {
    this.from = from;
    this.to = to;
    this.value = value;
    this.nonce = nonce;
    this.data = data;
    this.signature = signature;
    this.fee = fee;
  }

  public verify(accountState: AccountState): boolean {
    const expectedNonce = accountState.getNonce(this.from);
    if (this.nonce !== expectedNonce) {
      return false;
    }

    // Check for integer overflows
    if (this.value < 0 || this.nonce < 0 || this.fee < 0) {
      return false;
    }

    // Check for replay attacks
    if (accountState.hasSeenNonce(this.from, this.nonce)) {
      return false;
    }

    // Verify the signature
    const publicKey = recoverPublicKey(this.data, this.signature);
    if (publicKey !== this.from) {
      return false;
    }

    // Verify the signature is not malleable
    if (!verifySignature(this.data, this.signature, publicKey)) {
      return false;
    }

    // Verify the sender has enough balance to cover the transaction
    if (accountState.getBalance(this.from) < this.value + this.fee) {
      return false;
    }

    return true;
  }

  public calculateFee(): number {
    // Calculate the fee based on transaction size and complexity
    const baseGasPrice = 0.00001; // 0.01 cents per gas
    const gasLimit = 21000; // Base gas limit for a simple transfer
    let gasUsed = gasLimit;

    // Add additional gas for contract execution or complex operations
    if (this.data.length > 0) {
      gasUsed += 50000; // 50,000 gas for contract execution
    }

    const fee = baseGasPrice * gasUsed;
    return fee;
  }
}

export { Transaction };