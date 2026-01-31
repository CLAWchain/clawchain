import { Instruction, ExecutionContext } from './types';

export class VM {
  private instructions: Instruction[];
  private gasLimit: number;
  private gasUsed: number;

  constructor(instructions: Instruction[], gasLimit: number) {
    this.instructions = instructions;
    this.gasLimit = gasLimit;
    this.gasUsed = 0;
  }

  execute(): void {
    for (const instruction of this.instructions) {
      const gasCost = this.getGasCost(instruction);
      if (this.gasUsed + gasCost > this.gasLimit) {
        throw new Error('Insufficient gas');
      }
      this.executeInstruction(instruction);
      this.gasUsed += gasCost;
    }
  }

  private executeInstruction(instruction: Instruction): void {
    // Implement instruction execution logic here
  }

  private getGasCost(instruction: Instruction): number {
    switch (instruction.opcode) {
      case 'ADD':
        return 3;
      case 'MUL':
        return 5;
      case 'PUSH':
        return 3;
      case 'POP':
        return 2;
      default:
        return 1;
    }
  }
}