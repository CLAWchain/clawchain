import { Instruction, OperandSize } from './types';

export class VirtualMachine {
  private stack: number[] = [];
  private pc: number = 0;
  private memory: number[] = [];

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
        this.stack.push(instruction.operand as number);
        break;
      case 'POP':
        this.stack.pop();
        break;
      case 'ADD':
        this.binaryOperation((a, b) => a + b);
        break;
      case 'SUB':
        this.binaryOperation((a, b) => a - b);
        break;
      case 'MUL':
        this.binaryOperation((a, b) => a * b);
        break;
      case 'DIV':
        this.binaryOperation((a, b) => a / b);
        break;
      case 'JUMP':
        this.pc = instruction.operand as number;
        break;
      case 'JUMPI':
        this.pc = this.stack.pop() ? (instruction.operand as number) : this.pc;
        break;
      default:
        throw new Error(`Unknown opcode: ${instruction.opcode}`);
    }
  }

  private binaryOperation(operation: (a: number, b: number) => number) {
    const b = this.stack.pop();
    const a = this.stack.pop();
    this.stack.push(operation(a, b));
  }
}