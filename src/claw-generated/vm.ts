import { GAS_COSTS } from './vm-gas-costs';

export class VirtualMachine {
  private gasLimit: number;
  private gasRemaining: number;

  constructor(gasLimit: number) {
    this.gasLimit = gasLimit;
    this.gasRemaining = gasLimit;
  }

  execute(contract: Uint8Array, input: Uint8Array): Uint8Array {
    // Reset gas tracking
    this.gasRemaining = this.gasLimit;

    // Implement VM execution logic here, decrementing gas as operations are performed
    for (const op of contract) {
      const opCost = GAS_COSTS[op.toString()];
      if (opCost === undefined) {
        throw new Error(`Unknown VM operation: ${op}`);
      }
      this.gasRemaining -= opCost;
      if (this.gasRemaining < 0) {
        throw new Error('Out of gas');
      }
      // Perform the operation
    }

    return new Uint8Array();
  }
}