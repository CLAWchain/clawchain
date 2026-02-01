import { Instruction, VMState } from './types';

export class VM {
  private state: VMState = {
    stack: [],
    program: [],
    pc: 0,
  };

  execute(program: Instruction[]) {
    this.state.program = program;
    while (this.state.pc < this.state.program.length) {
      this.step();
    }
    return this.state.stack[this.state.stack.length - 1];
  }

  private step() {
    const instruction = this.state.program[this.state.pc];
    switch (instruction.opcode) {
      case 'PUSH':
        this.state.stack.push(instruction.operand);
        break;
      case 'ADD':
        this.binaryOp((a, b) => a + b);
        break;
      case 'SUB':
        this.binaryOp((a, b) => a - b);
        break;
      case 'MUL':
        this.binaryOp((a, b) => a * b);
        break;
      case 'DIV':
        this.binaryOp((a, b) => a / b);
        break;
    }
    this.state.pc++;
  }

  private binaryOp(op: (a: number, b: number) => number) {
    const b = this.state.stack.pop();
    const a = this.state.stack.pop();
    this.state.stack.push(op(a, b));
  }
}