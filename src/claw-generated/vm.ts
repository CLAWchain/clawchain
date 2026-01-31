// ClawChain Contract Virtual Machine

import { Instruction, ContractState } from './types';

class VM {
  private stack: any[] = [];
  private state: ContractState;

  constructor(initialState: ContractState) {
    this.state = initialState;
  }

  execute(instructions: Instruction[]) {
    for (const instruction of instructions) {
      this.executeInstruction(instruction);
    }
  }

  private executeInstruction(instruction: Instruction) {
    switch (instruction.opcode) {
      case 'PUSH':
        this.stack.push(instruction.operand);
        break;
      case 'ADD':
        this.stack.push(this.stack.pop() + this.stack.pop());
        break;
      case 'SUB':
        const b = this.stack.pop();
        const a = this.stack.pop();
        this.stack.push(a - b);
        break;
      // Add more instruction handlers here
      default:
        throw new Error(`Unknown opcode: ${instruction.opcode}`);
    }
  }
}

export { VM, Instruction, ContractState };