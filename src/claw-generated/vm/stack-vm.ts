import { Instruction } from './instructions';

export class StackVM {
  private stack: number[] = [];
  private pc: number = 0;
  private memory: number[] = [];

  execute(bytecode: number[]) {
    while (this.pc < bytecode.length) {
      const instruction = bytecode[this.pc] as Instruction;
      this.executeInstruction(instruction, bytecode);
      this.pc++;
    }
  }

  private executeInstruction(instruction: Instruction, bytecode: number[]) {
    switch (instruction) {
      case Instruction.PUSH:
        this.stack.push(bytecode[++this.pc]);
        break;
      case Instruction.POP:
        this.stack.pop();
        break;
      case Instruction.ADD:
        this.stack.push(this.stack.pop() + this.stack.pop());
        break;
      case Instruction.SUB:
        const b = this.stack.pop();
        const a = this.stack.pop();
        this.stack.push(a - b);
        break;
      case Instruction.MUL:
        this.stack.push(this.stack.pop() * this.stack.pop());
        break;
      case Instruction.DIV:
        const divisor = this.stack.pop();
        const dividend = this.stack.pop();
        this.stack.push(dividend / divisor);
        break;
      case Instruction.JUMP:
        this.pc = bytecode[++this.pc];
        break;
      case Instruction.JUMPI:
        const condition = this.stack.pop();
        if (condition !== 0) {
          this.pc = bytecode[++this.pc];
        } else {
          this.pc++;
        }
        break;
      case Instruction.STOP:
        this.pc = bytecode.length;
        break;
      default:
        throw new Error(`Unknown instruction: ${instruction}`);
    }
  }
}