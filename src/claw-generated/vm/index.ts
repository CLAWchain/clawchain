import { GasMetering } from './gas-metering';

export class VirtualMachine {
  private gasMetering: GasMetering;

  constructor() {
    this.gasMetering = new GasMetering();
  }

  executeContract(contractCode: Uint8Array, input: Uint8Array): Uint8Array {
    // Initialize gas
    this.gasMetering.resetGas();

    // Execute contract code
    const result = this.executeContractCode(contractCode, input);

    // Check if gas was depleted
    if (this.gasMetering.isGasExhausted()) {
      throw new Error('Contract execution ran out of gas');
    }

    return result;
  }

  private executeContractCode(contractCode: Uint8Array, input: Uint8Array): Uint8Array {
    // Placeholder for actual contract execution logic
    this.gasMetering.consumeGas(100); // Consume 100 gas for each operation
    return new Uint8Array([0x01, 0x02, 0x03]);
  }
}

export class GasMetering {
  private gasBalance: number;
  private gasLimit: number;

  constructor() {
    this.gasBalance = 0;
    this.gasLimit = 1000000; // Initial gas limit
  }

  resetGas(): void {
    this.gasBalance = this.gasLimit;
  }

  consumeGas(amount: number): void {
    this.gasBalance -= amount;
  }

  isGasExhausted(): boolean {
    return this.gasBalance <= 0;
  }
}