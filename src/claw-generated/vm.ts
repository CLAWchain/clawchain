import { Contract } from './contract';

export class VM {
  execute(contract: Contract, opcode: string, params: any): any {
    switch (opcode) {
      case 'CALL':
        return this.handleCall(contract, params);
      // Other opcodes...
      default:
        throw new Error(`Unknown opcode: ${opcode}`);
    }
  }

  private handleCall(contract: Contract, params: any): any {
    // Extract call parameters
    const { target, method, gas } = params;

    // Allocate gas for the call
    const callGas = gas || 1000000; // Default to 1 million gas

    // Execute the target contract
    const result = contract.call(target, method, { gas: callGas });

    // Forward any remaining gas back to the calling contract
    contract.refundGas(callGas - result.gasUsed);

    return result.returnValue;
  }
}