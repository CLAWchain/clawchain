import { GAS_COSTS } from './gas-costs';

export class VirtualMachine {
  private gasLimit: number;
  private gasUsed: number = 0;

  constructor(gasLimit: number) {
    this.gasLimit = gasLimit;
  }

  execute(instructions: number[]) {
    for (const instruction of instructions) {
      this.checkGasLimit();
      this.executeInstruction(instruction);
    }
  }

  private checkGasLimit() {
    if (this.gasUsed >= this.gasLimit) {
      throw new Error('Ran out of gas');
    }
  }

  private executeInstruction(instruction: number) {
    const opcode = instruction & 0xFF;
    const gasCost = GAS_COSTS[opcode] || 0;
    this.gasUsed += gasCost;
    // Execute the instruction
  }
}