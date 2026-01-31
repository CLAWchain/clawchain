import { StateManager } from './state_manager';

class Transaction {
  private from: string;
  private to: string;
  private value: number;
  private nonce: number;

  constructor(from: string, to: string, value: number, nonce: number) {
    this.from = from;
    this.to = to;
    this.value = value;
    this.nonce = nonce;
  }

  verify(): boolean {
    // Verify the transaction signature and nonce
    // (implementation omitted for brevity)
    return true;
  }

  apply(stateManager: StateManager): void {
    // Update the state based on the transaction
    stateManager.setState(this.from, (parseInt(stateManager.getState(this.from)) - this.value).toString());
    stateManager.setState(this.to, (parseInt(stateManager.getState(this.to)) + this.value).toString());
    stateManager.setState(`${this.from}:nonce`, this.nonce.toString());
  }
}

export { Transaction };