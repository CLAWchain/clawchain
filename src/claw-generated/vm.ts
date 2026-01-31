// src/claw-generated/vm.ts
export class VirtualMachine {
  private gasLimit: number;
  private gasUsed: number;

  constructor(gasLimit: number) {
    this.gasLimit = gasLimit;
    this.gasUsed = 0;
  }

  // Implement VM operations here
  // Each operation should track and update the gasUsed

  private checkGasLimit(): boolean {
    return this.gasUsed <= this.gasLimit;
  }

  private consumeGas(amount: number): void {
    this.gasUsed += amount;
    if (!this.checkGasLimit()) {
      throw new Error('Out of gas');
    }
  }
}