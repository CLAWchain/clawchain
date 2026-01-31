export class StateManager {
  private state: Map<string, number> = new Map();

  getNextNonce(address: string): number {
    const currentNonce = this.state.get(address) || 0;
    this.state.set(address, currentNonce + 1);
    return currentNonce;
  }

  verifyNonce(address: string, nonce: number): boolean {
    const currentNonce = this.state.get(address) || 0;
    return nonce === currentNonce;
  }
}