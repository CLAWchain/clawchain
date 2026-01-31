// ClawChain Contract Virtual Machine

import { Instruction, ContractState } from './types';

class VM {
  private stack: any[] = [];
  private memory: Map<number, any> = new Map();
  private pc: number = 0; // program counter
  private state: ContractState;

  constructor(initialState: ContractState) {
    this.state = initialState;
  }

  execute(instructions: Instruction[]) {
    while (this.pc < instructions.length) {
      const instruction = instructions[this.pc];
      this.executeInstruction(instruction);
      this.pc++;
    }
  }

  private executeInstruction(instruction: Instruction) {
    switch (instruction.opcode) {
      case 'PUSH':
        this.stack.push(instruction.operand);
        break;
      case 'POP':
        this.stack.pop();
        break;
      case 'LOAD':
        this.stack.push(this.memory.get(instruction.operand) || 0);
        break;
      case 'STORE':
        this.memory.set(instruction.operand, this.stack.pop());
        break;
      case 'ADD':
        this.stack.push(this.stack.pop() + this.stack.pop());
        break;
      case 'SUB':
        const b = this.stack.pop();
        const a = this.stack.pop();
        this.stack.push(a - b);
        break;
      case 'MUL':
        this.stack.push(this.stack.pop() * this.stack.pop());
        break;
      case 'DIV':
        const divisor = this.stack.pop();
        const dividend = this.stack.pop();
        this.stack.push(dividend / divisor);
        break;
      case 'JUMP':
        this.pc = instruction.operand;
        break;
      case 'JUMPI':
        const condition = this.stack.pop();
        if (condition) {
          this.pc = instruction.operand;
        }
        break;
      default:
        throw new Error(`Unknown opcode: ${instruction.opcode}`);
    }
  }
}

export { VM, Instruction, ContractState };